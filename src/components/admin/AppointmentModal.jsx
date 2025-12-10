import { useEffect, useMemo } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApi } from '../../hooks/useApi';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopTimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { esES } from '@mui/x-date-pickers/locales';

const getEmptyForm = () => ({
  id: null,
  pacienteId: '',
  usuarioId: '',
  motivo: '',
  observaciones: '',
  appointmentTime: null,
  estado: 'scheduled',
});

const appointmentSchema = z.object({
  pacienteId: z.string().min(1, 'Debe seleccionar un paciente.'),
  usuarioId: z.string().min(1, 'El odontólogo es requerido.'),
  motivo: z.string().min(1, 'El motivo de la cita es requerido.'),
  observaciones: z.string().optional(),
  appointmentTime: z.date({ required_error: "La hora de la cita es requerida." }).nullable(false).refine(date => {
    const hour = date.getHours();
    return hour >= 9 && hour < 18;
  }, { message: "La hora de la cita debe estar entre las 9:00 AM y las 6:00 PM." }),
  estado: z.string(),
});

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? '2px solid #3b82f6' : '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
    },
    padding: '2px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    '&:active': {
      backgroundColor: '#2563eb',
    },
  }),
};

const statusOptions = [
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'InProgress', label: 'En Curso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const statusDisplayMap = {
  scheduled: { label: 'Agendada', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-800' },
  InProgress: { label: 'En Curso', className: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completada', className: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
  no_show: { label: 'No Asistió', className: 'bg-orange-100 text-orange-800' },
};

const backendToFormStatusMap = {
  Scheduled: 'scheduled',
  Confirmed: 'confirmed',
  InProgress: 'InProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'no_show',
};

const getStatusDisplay = (status) => statusDisplayMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  slotInfo, 
  eventToEdit, 
  patients, 
  users, 
  events,
  selectedUserId: agendaSelectedUserId,
  scheduleConfig 
}) => {
  const { isLoading: isSaving } = useApi();
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);
  const isEditing = !!eventToEdit;

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: getEmptyForm(),
  });

  const patientOptions = useMemo(() =>
    patients.map(p => ({ value: p.id, label: p.nombreCompleto })),
    [patients]
  );

  // **CORREGIDO**: La fecha activa SIEMPRE debe ser la del día seleccionado en el calendario.
  // Al editar, `slotInfo` no existe, pero la fecha de la cita (`eventToEdit.fechaHora`) nos sirve
  // para determinar el día que se debe filtrar.
  const activeDate = slotInfo?.start || (eventToEdit ? new Date(eventToEdit.fechaHora) : null);

  // Efecto unificado para configurar el modal y generar los horarios disponibles
  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        reset({
          id: eventToEdit.id,
          pacienteId: eventToEdit.pacienteId || '',
          usuarioId: eventToEdit.usuarioId || '',
          motivo: eventToEdit.motivo || '',
          observaciones: eventToEdit.observaciones || '',
          appointmentTime: new Date(eventToEdit.fechaHora),
          estado: backendToFormStatusMap[eventToEdit.estado] || 'scheduled',
        });
      } else if (slotInfo) {
        reset({
          ...getEmptyForm(),
          usuarioId: agendaSelectedUserId,
          appointmentTime: slotInfo.start,
        });
      }
    } else {
      reset(getEmptyForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventToEdit, slotInfo, reset]);

  const onFormSubmit = (data) => {
    const finalFechaHora = format(data.appointmentTime, "yyyy-MM-dd'T'HH:mm:ss");

    // Construimos el payload exacto que la API espera
    const payload = {
      pacienteId: data.pacienteId,
      usuarioId: data.usuarioId,
      motivo: data.motivo,
      observaciones: data.observaciones,      
      fechaHora: finalFechaHora,
      estado: data.estado,
      // La duración ahora la define el backend o es un valor fijo.
      duracionMinutos: 30, // O el valor que corresponda
    };
    
    onSave(isEditing ? eventToEdit.id : null, payload);
  };

  const appointmentTimeValue = watch('appointmentTime');

  const modalTitle = useMemo(() => {
    if (isEditing) {
      const displayStatus = backendToFormStatusMap[eventToEdit.estado] || 'scheduled';

      const statusInfo = getStatusDisplay(displayStatus);

      return (
        <div className="flex items-center gap-3">
          <span>Editar Cita</span>
          <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>
      );
    }
    if (appointmentTimeValue) {
      const formattedTime = format(appointmentTimeValue, 'h:mm a', { locale: es });
      return `Nueva Cita a las: ${formattedTime}`;
    }
    return 'Crear Nueva Cita';
  }, [isEditing, eventToEdit, appointmentTimeValue]);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="appointment-form" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-800">Paciente</label>
              <Controller
                name="pacienteId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={patientOptions}
                    value={patientOptions.find(option => option.value === field.value)}
                    onChange={option => field.onChange(option ? option.value : '')}
                    placeholder="Buscar y seleccionar un paciente..."
                    noOptionsMessage={() => 'No se encontraron pacientes'}
                    className="mt-1"
                    styles={customSelectStyles}
                  />
                )}
              />
              {errors.pacienteId && <p className="mt-1 text-sm text-red-600">{errors.pacienteId.message}</p>}
            </div>
            {isEditing && (
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-800">Estado de la Cita</label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={statusOptions}
                      value={statusOptions.find(option => option.value === field.value)}
                      onChange={option => field.onChange(option ? option.value : '')}
                      className="mt-1"
                      styles={customSelectStyles}
                    />
                  )}
                />
                {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>}
              </div>
            )}
            {(slotInfo || isEditing) && (
              <div>
                <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-800">Hora de la Cita</label>
                <Controller
                  name="appointmentTime"
                  control={control}
                  render={({ field }) => (
                    <LocalizationProvider 
                      dateAdapter={AdapterDateFns} 
                      adapterLocale={es}
                      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                    >
                      <DesktopTimePicker
                        {...field}
                        minutesStep={5}
                        ampm={true}
                        className="w-full mt-1"
                        slotProps={{
                          textField: { 
                            id: 'appointment-time', 
                            className: 'w-full', 
                            variant: 'outlined', 
                            size: 'small',
                            error: !!errors.appointmentTime,
                            helperText: errors.appointmentTime?.message,
                          }
                        }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </div>
            )}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-800">Motivo de la Cita</label>
              <input type="text" id="motivo" {...register('motivo')} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.motivo && <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>}
            </div>
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-800">Observaciones</label>
              <textarea id="observaciones" {...register('observaciones')} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              {errors.observaciones && <p className="mt-1 text-sm text-red-600">{errors.observaciones.message}</p>}
            </div>
          </div>
        </form>
        </div>
        <div className="flex justify-end p-6 space-x-3 border-t border-gray-200">
          {isEditing && (
            <button 
              type="button" 
              onClick={() => onDelete(eventToEdit)} 
              disabled={isSaving} 
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 mr-auto transition-all duration-200"
            >
              Eliminar Cita
            </button>
          )}
          <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
          <button type="submit" form="appointment-form" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-blue-50 rounded-md bg-primary hover:bg-hover-btn-primary font-semibold hover:text-white disabled:bg-gray-400">
            {isSaving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Agendar Cita')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;