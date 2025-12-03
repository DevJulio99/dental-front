import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApi } from '../../hooks/useApi';
import Select from 'react-select';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopTimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { esES } from '@mui/x-date-pickers/locales';

const getEmptyForm = () => ({
  pacienteId: '',
  usuarioId: '',
  motivo: '',
  observaciones: '',
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
  const [formData, setFormData] = useState(getEmptyForm());
  const [appointmentTime, setAppointmentTime] = useState(null); // Estado para la hora de la cita
  const { isLoading: isSaving } = useApi(); // Ya no necesitamos 'get' aquí
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);
  const isEditing = !!eventToEdit;

  const patientOptions = useMemo(() =>
    patients.map(p => ({ value: p.id, label: p.nombreCompleto })),
    [patients]
  );

  const selectedPatient = useMemo(() =>
    patientOptions.find(option => option.value === formData.pacienteId),
    [patientOptions, formData.pacienteId]
  );

  // **CORREGIDO**: La fecha activa SIEMPRE debe ser la del día seleccionado en el calendario.
  // Al editar, `slotInfo` no existe, pero la fecha de la cita (`eventToEdit.fechaHora`) nos sirve
  // para determinar el día que se debe filtrar.
  const activeDate = slotInfo?.start || (eventToEdit ? new Date(eventToEdit.fechaHora) : null);

  // Efecto unificado para configurar el modal y generar los horarios disponibles
  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        // Modo Editar: Cargamos los datos de la cita existente
        setFormData({
          id: eventToEdit.id,
          pacienteId: eventToEdit.pacienteId || '',
          usuarioId: eventToEdit.usuarioId || '',
          motivo: eventToEdit.motivo || '',
          observaciones: eventToEdit.observaciones || '',
        });
        setAppointmentTime(new Date(eventToEdit.fechaHora));
      } else if (slotInfo) {
        // Modo Crear: Reseteamos el formulario y pre-seleccionamos datos
        setAppointmentTime(slotInfo.start);
        setFormData({ ...getEmptyForm(), usuarioId: agendaSelectedUserId });
      }
    } else {
      setAppointmentTime(null);
      setFormData(getEmptyForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventToEdit, slotInfo]);

  const handlePatientChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, pacienteId: selectedOption ? selectedOption.value : '' }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.usuarioId || !formData.motivo) {
      toast.error('Paciente, Odontólogo y Motivo son obligatorios.');
      return;
    }

    if (appointmentTime) {
      const selectedHour = appointmentTime.getHours();
      const isWithinWorkingHours = selectedHour >= 9 && selectedHour < 18;

      if (!isWithinWorkingHours) {
        toast.error('La hora de la cita debe estar entre las 9:00 AM y las 6:00 PM.');
        return;
      }
    }

    const finalFechaHora = format(appointmentTime, "yyyy-MM-dd'T'HH:mm:ss");

    // Construimos el payload exacto que la API espera
    const payload = {
      pacienteId: formData.pacienteId,
      usuarioId: formData.usuarioId,
      motivo: formData.motivo,
      observaciones: formData.observaciones,      
      fechaHora: finalFechaHora,
      // La duración ahora la define el backend o es un valor fijo.
      duracionMinutos: 30, // O el valor que corresponda
      // Los campos appointmentDate y startTime se pueden derivar en el backend desde fechaHora si es necesario
    };
    
    // El ID solo se pasa si estamos editando, para construir la URL. No va en el payload.
    onSave(formData.id, payload);
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleTimeChange = (newDate) => setAppointmentTime(newDate);

  const modalTitle = useMemo(() => {
    if (isEditing) {
      return 'Editar Cita';
    }
    if (appointmentTime) {
      const formattedTime = format(appointmentTime, 'h:mm a', { locale: es });
      return `Nueva Cita a las: ${formattedTime}`;
    }
    return 'Crear Nueva Cita';
  }, [isEditing, appointmentTime]);

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
          <form id="appointment-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-800">Paciente</label>
              <Select
                id="pacienteId"
                options={patientOptions}
                value={selectedPatient}
                onChange={handlePatientChange}
                placeholder="Buscar y seleccionar un paciente..."
                noOptionsMessage={() => 'No se encontraron pacientes'}
                className="mt-1"
                styles={customSelectStyles}
                required
              />
            </div>
            {(slotInfo || isEditing) && (
              <div>
                <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-800">Hora de la Cita</label>
                <LocalizationProvider 
                  dateAdapter={AdapterDateFns} 
                  adapterLocale={es}
                  localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                  <DesktopTimePicker
                    value={appointmentTime}
                    onChange={handleTimeChange}
                    minutesStep={5} // Puedes ajustar el paso de los minutos
                    ampm={true}
                    className="w-full mt-1"
                    slotProps={{
                      textField: { 
                        id: 'appointment-time', 
                        className: 'w-full', 
                        variant: 'outlined', 
                        size: 'small' 
                      }
                    }}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                  />
                </LocalizationProvider>
              </div>
            )}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-800">Motivo de la Cita</label>
              <input type="text" id="motivo" value={formData.motivo} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-800">Observaciones</label>
              <textarea id="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
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
            {isSaving ? 'Guardando...' : 'Agendar Cita'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;