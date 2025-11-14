import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { parseISO, isToday, isAfter, isEqual, startOfDay } from 'date-fns';
import { format } from 'date-fns-tz';
import { differenceInMinutes } from 'date-fns';
import { useApi } from '../../hooks/useApi';

const emptyForm = {
  pacienteId: '',
  usuarioId: '',
  motivo: '',
  observaciones: '',
};
const AppointmentModal = ({ isOpen, onClose, onSave, onDelete, slotInfo, eventToEdit, patients, users, events }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const { isLoading: isSaving, get } = useApi(); // Renombramos isLoading a isSaving para claridad
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);
  const isEditing = !!eventToEdit;

  // **CORREGIDO**: La fecha activa SIEMPRE debe ser la del día seleccionado en el calendario.
  // Al editar, `slotInfo` no existe, pero la fecha de la cita (`eventToEdit.fechaHora`) nos sirve
  // para determinar el día que se debe filtrar.
  const activeDate = slotInfo?.start || (eventToEdit ? new Date(eventToEdit.fechaHora) : null);

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
      } else {
        // Modo Crear: Reseteamos el formulario y los horarios
        // Esto es crucial para que al abrir el modal para crear, no haya datos residuales.
        setFormData(emptyForm);
        setAvailableTimes([]);
        setSelectedTime('');
      }
    }
  }, [isOpen, eventToEdit]); // Solo depende de si el modal se abre o cambia el evento a editar.

  // Efecto para cargar los horarios disponibles
  useEffect(() => {
    if (isOpen && !isEditing && formData.usuarioId && activeDate) {
      const fetchAvailableTimes = async () => {
        setIsLoadingTimes(true);
        setAvailableTimes([]); // Limpiamos horarios anteriores
        setSelectedTime('');
        try {
          const date = format(activeDate, 'yyyy-MM-dd');
          const tenantInfo = JSON.parse(localStorage.getItem('tenant'));
          const subdomain = tenantInfo?.subdominio;

          if (!subdomain) {
            toast.error('No se pudo identificar el consultorio. No se pueden cargar los horarios.');
            return;
          }

          const times = await get(`/public/horarios-disponibles?subdomain=${subdomain}&fecha=${date}&usuarioId=${formData.usuarioId}`);
          if (Array.isArray(times)) {
            setAvailableTimes(times);
          }
        } catch (err) {
          toast.error(err.message || 'No se pudieron cargar los horarios.');
        } finally {
          setIsLoadingTimes(false);
        }
      };

      fetchAvailableTimes();
    }
    // Si no hay odontólogo seleccionado, limpiamos la lista
    if (!formData.usuarioId) setAvailableTimes([]);
  }, [isOpen, isEditing, formData.usuarioId, activeDate, get]); // Depende de isEditing para no ejecutarse al editar.

  if (!isOpen) {
    return null;
  }

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
      if (!selectedTime) {
        toast.error('Debe seleccionar una hora para la cita.');
        return;
      }
      finalFechaHora = selectedTime;
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

  const handleTimeSelectChange = (e) => {
    const timeValue = e.target.value;
    setSelectedTime(timeValue);
  };

  // Filtramos los horarios para el día de hoy, para mostrar solo los futuros.
  const isSelectedDateToday = activeDate ? isToday(activeDate) : false;
  
  // Obtenemos los horarios ya ocupados para el odontólogo y fecha seleccionados
  const bookedTimes = events
    .filter(event => 
      event.resource.usuarioId === formData.usuarioId && 
      (!isEditing || event.id !== eventToEdit.id) &&
      // Comparamos solo el día, mes y año, ignorando la zona horaria.
      (activeDate && isEqual(startOfDay(new Date(event.start)), startOfDay(activeDate)))
    )
    // **CORREGIDO**: Forzamos la interpretación de la hora como UTC para evitar conversiones de zona horaria.
    // Esto asegura que "12:00" se compare con "12:00", sin importar la zona horaria del navegador.
    .map(event => format(new Date(event.start), 'HH:mm:ss', { timeZone: 'UTC' }));
  console.log('bookedTimes:', bookedTimes);
  const filteredTimes = availableTimes.filter(timeString => {
    // **CORREGIDO**: Hacemos lo mismo para los horarios disponibles, los tratamos como UTC.
    const availableTimePart = format(parseISO(timeString), 'HH:mm:ss', { timeZone: 'UTC' });

    // 1. Filtro para no mostrar horarios pasados en el día de hoy.
    if (isSelectedDateToday && !isAfter(parseISO(timeString), new Date())) {
      return false;
    }

    // 2. Filtro para no mostrar horarios ya ocupados.
    return !bookedTimes.includes(availableTimePart);
  });

  console.log('filteredTimes:', filteredTimes);

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{eventToEdit ? 'Editar Cita' : 'Crear Nueva Cita'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700">Paciente</label>
              <select id="pacienteId" value={formData.pacienteId} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="" disabled>Seleccione un paciente</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="usuarioId" className="block text-sm font-medium text-gray-700">Odontólogo</label>
              <select id="usuarioId" value={formData.usuarioId} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="" disabled>Seleccione un odontólogo</option>
                {users.map(u => <option key={u.id} value={u.id}>{`${u.nombre} ${u.apellido}`}</option>)}
              </select>
            </div>
            {!isEditing && (
              <div>
                <label htmlFor="horaCita" className="block text-sm font-medium text-gray-700">Hora de la Cita</label>
                <select id="horaCita" value={selectedTime} onChange={handleTimeSelectChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required disabled={isLoadingTimes || availableTimes.length === 0}>
                  <option value="" disabled>
                    {isLoadingTimes ? 'Cargando horarios...' : (formData.usuarioId ? 'Seleccione una hora' : 'Seleccione un odontólogo primero')}
                  </option>
                  {filteredTimes.map(time => (
                    <option key={time} value={time}>
                      {format(parseISO(time), 'HH:mm')}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">Motivo de la Cita</label>
              <input type="text" id="motivo" value={formData.motivo} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea id="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            {isEditing && (
              <button type="button" onClick={() => onDelete(eventToEdit)} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-error rounded-md hover:bg-red-700 disabled:opacity-50 mr-auto">Eliminar Cita</button>
            )}
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSaving || isLoadingTimes} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;