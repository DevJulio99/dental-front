import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { format } from 'date-fns-tz';
import { useApi } from '../../hooks/useApi';
import Select from 'react-select';

const emptyForm = {
  pacienteId: '',
  usuarioId: '',
  motivo: '',
  observaciones: '',
};

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
  const [formData, setFormData] = useState(emptyForm);
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
      } else if (slotInfo) {
        // Modo Crear: Reseteamos el formulario y pre-seleccionamos datos
        setFormData({ ...emptyForm, usuarioId: agendaSelectedUserId });
      }
    }
  }, [isOpen, isEditing, agendaSelectedUserId, activeDate, scheduleConfig, eventToEdit, slotInfo]);

  const handlePatientChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, pacienteId: selectedOption ? selectedOption.value : '' }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.usuarioId || !formData.motivo) {
      toast.error('Paciente, Odontólogo y Motivo son obligatorios.');
      return;
    }

    let finalFechaHora;
    if (isEditing) {
      finalFechaHora = format(new Date(eventToEdit.fechaHora), "yyyy-MM-dd'T'HH:mm:ss");
    } else {
      finalFechaHora = format(slotInfo.start, "yyyy-MM-dd'T'HH:mm:ss");
    }

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

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{eventToEdit ? 'Editar Cita' : 'Crear Nueva Cita'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
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
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-800">Motivo de la Cita</label>
              <input type="text" id="motivo" value={formData.motivo} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-800">Observaciones</label>
              <textarea id="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
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
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 transition-all duration-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSaving ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;