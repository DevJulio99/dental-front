import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // ¡Importación clave!
import './Agenda.scss';
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { isBefore, startOfToday } from 'date-fns';
import es from 'date-fns/locale/es';
import AppointmentModal from '../../components/admin/AppointmentModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

// Configuración del localizador en español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes como inicio de semana
  getDay,
  locales,
});

// Horario de trabajo simulado. En una app real, esto vendría de la API
// basado en la configuración que acabamos de crear.
const workDayStart = new Date();
workDayStart.setHours(9, 0, 0, 0);
const workDayEnd = new Date();
workDayEnd.setHours(18, 0, 0, 0);

const CustomEvent = ({ event }) => (
  <div className={`h-full pl-2 border-l-4 ${event.style?.borderClass || 'border-transparent'}`}>
    <div title={event.title} className="h-full flex flex-col justify-center overflow-hidden">
      <strong className="font-semibold truncate block">{event.title.split(' - ')[0]}</strong>
      <span className="truncate block text-xs">{event.title.split(' - ')[1]}</span>
    </div>
  </div>
);

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const { isLoading, get, post, put, del } = useApi();
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // Guardará slotInfo o el evento a editar
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Estado para la fecha actual del calendario

  // Paleta de colores para asignar a cada odontólogo
  const colorPalette = useMemo(
    () => [
      { background: '#eff6ff', border: '#3b82f6', text: '#1e40af', borderClass: 'border-blue-500' },
      { background: '#f0fdf4', border: '#22c55e', text: '#166534', borderClass: 'border-green-500' },
      { background: '#faf5ff', border: '#9333ea', text: '#581c87', borderClass: 'border-purple-500' },
      { background: '#fefce8', border: '#eab308', text: '#854d0e', borderClass: 'border-yellow-500' },
      { background: '#fdf2f8', border: '#ec4899', text: '#9d2463', borderClass: 'border-pink-500' },
      { background: '#eef2ff', border: '#6366f1', text: '#3730a3', borderClass: 'border-indigo-500' },
    ],
    []
  );

  // Asigna un color a cada odontólogo para consistencia visual
  const userColorMap = useMemo(() => {
    const map = new Map();
    users.forEach((user, index) => {
      map.set(user.id, colorPalette[index % colorPalette.length]);
    });
    return map;
  }, [users, colorPalette]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsListLoading(true);
        setListError(null);

        // Hacemos todas las llamadas en paralelo para mayor eficiencia
        const [citasData, patientsData, usersData] = await Promise.all([
          get('/Citas'),
          get('/Pacientes'),
          get('/Usuarios')
        ]);

        // Primero, poblamos los estados de pacientes y usuarios.
        const validPatients = Array.isArray(patientsData) ? patientsData : [];
        const validUsers = Array.isArray(usersData) ? usersData.filter(u => u.rol === 'Odontologo') : [];
        setPatients(validPatients);
        setUsers(validUsers);

        // Luego, con los datos ya disponibles, formateamos las citas.
        if (Array.isArray(citasData)) {
          const formattedEvents = citasData.map(cita => ({
            id: cita.id, // Propiedad requerida por el calendario
            title: `${cita.motivo} - ${validPatients.find(p => p.id === cita.pacienteId)?.nombreCompleto || 'Paciente no encontrado'}`,
            start: new Date(cita.fechaHora),
            end: new Date(new Date(cita.fechaHora).getTime() + cita.duracionMinutos * 60000),
            // Anidamos el resto de los datos en 'resource' para no interferir con el calendario
            resource: cita,
          }));
          setEvents(formattedEvents);
        }
      } catch (err) {
        setListError(err.message || 'No se pudo cargar la agenda.');
        toast.error('Error al cargar las citas.');
      } finally {
        setIsListLoading(false);
      }
    };

    fetchAppointments();
  }, [get]);

  // Esta función se dispara al hacer clic en una cita existente
  const handleSelectEvent = (event) => {
    console.log('event:', event.resource);
    // Abrimos el modal en modo edición, pasando el evento seleccionado
    setModalData({ eventToEdit: event.resource }); // Pasamos los datos anidados
    setIsModalOpen(true);
  };

  // Esta función se dispara al seleccionar un rango de tiempo vacío en el calendario
  const handleSelectSlot = (slotInfo) => {
    console.log('slotInfo:', slotInfo);
    // Validamos que no se puedan crear citas en fechas u horas pasadas del día actual.
    if (isBefore(slotInfo.start, new Date())) {
      toast.error('No se pueden agendar citas en fechas u horas pasadas.');
      return; // No abre el modal
    }
    // Abrimos el modal en modo creación, pasando la info del slot
    setModalData({ slotInfo });
    setIsModalOpen(true);
  };

  // Esta función evita que el calendario cambie de vista (ej: de semana a día) al hacer clic.
  // Esto permite que onSelectSlot se active con un solo clic.
  const handleDrillDown = (date, view) => {
    // No hacemos nada para mantener la vista actual.
  };

  // Esta función es necesaria para que el calendario maneje la navegación entre semanas/días.
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleSaveAppointment = async (id, payload) => {
    try {
      if (id) {
        // Lógica de Edición (PUT)
        await put(`/Citas/${id}`, payload);
        
        // Reconstruimos el objeto completo para actualizar la UI
        const updatedAppointmentForUI = { id, ...payload };

        // Actualizamos el evento en la lista del calendario
        setEvents(events.map(event => {
          if (event.id === id) {
            return { // Reconstruimos el evento para la UI
              id: updatedAppointmentForUI.id,
              title: `${updatedAppointmentForUI.motivo} - ${patients.find(p => p.id === updatedAppointmentForUI.pacienteId)?.nombreCompleto}`,
              start: new Date(updatedAppointmentForUI.fechaHora),
              end: new Date(new Date(updatedAppointmentForUI.fechaHora).getTime() + updatedAppointmentForUI.duracionMinutos * 60000),
              resource: updatedAppointmentForUI,
            };
          }
          return event;
        }));
        toast.success(`Cita actualizada con éxito.`);
      } else {
        // Lógica de Creación (POST)
        const newAppointment = await post('/Citas', payload);
        
        // Añadimos el nuevo evento a la lista del calendario
        const newEventForUI = {
          id: newAppointment.id,
          title: `${payload.motivo} - ${patients.find(p => p.id === payload.pacienteId)?.nombreCompleto}`,
          start: new Date(payload.fechaHora),
          end: new Date(new Date(payload.fechaHora).getTime() + payload.duracionMinutos * 60000),
          resource: { ...payload, id: newAppointment.id },
        };
        setEvents([...events, newEventForUI]);
        toast.success(`Cita para "${newEventForUI.title}" agendada.`);
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar la cita.');
    }
  };

  // Función para aplicar estilos personalizados a cada evento del calendario
  const eventPropGetter = useCallback((event) => {
    const userColor = userColorMap.get(event.resource?.usuarioId);
    const style = {
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
      borderRadius: '5px',
      border: 'none',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
      borderClass: 'border-gray-400'
    };

    if (userColor) {
      style.backgroundColor = userColor.background;
      style.color = userColor.text;
      style.borderClass = userColor.borderClass;
    }
    return { style };
  }, [userColorMap]);

  // Abre el modal de confirmación para eliminar
  const handleDeleteAppointment = (appointment) => {
    setAppointmentToDelete(appointment);
    // Cerramos el modal de edición para que no se solapen
    handleCloseModal();
  };

  // Se ejecuta si el usuario confirma la eliminación
  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        await del(`/Citas/${appointmentToDelete.id}`);
        setEvents(events.filter(event => event.id !== appointmentToDelete.id));
        toast.success('Cita eliminada con éxito.');
        setAppointmentToDelete(null); // Cierra el modal de confirmación
      } catch (err) {
        toast.error(err.message || 'No se pudo eliminar la cita.');
      } finally {
        setAppointmentToDelete(null);
      }
    }
  };

  if (isListLoading) {
    return <LoadingSpinner />;
  }

  if (listError) {
    return <div className="flex items-center justify-center h-full text-red-500">{listError}</div>;
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          min={workDayStart} // Hora de inicio visible
          max={workDayEnd}   // Hora de fin visible
          culture='es' // Le indicamos al calendario que use la cultura española
          onSelectEvent={handleSelectEvent}
          date={currentDate} // Controlamos la fecha del calendario
          onNavigate={handleNavigate} // Manejador para la navegación
          onDrillDown={handleDrillDown}
          defaultView='week' // Cambiamos la vista por defecto a 'semana'
          onSelectSlot={handleSelectSlot}
          selectable={'click'} // 'click' es clave para que onSelectSlot se active con un solo clic
          step={15} // Cada slot representa 15 minutos
          timeslots={4} // Se mostrarán 4 slots por hora
          eventPropGetter={eventPropGetter} // Aplicamos nuestros estilos personalizados
          components={{
            event: CustomEvent,
          }}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            showMore: (total) => `+ Ver más (${total})`,
            allDay: 'Todo el día',
            work_week: 'Semana Laboral',
            noEventsInRange: "No hay citas en este rango.",
          }}
        />
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
          slotInfo={modalData?.slotInfo}
          eventToEdit={modalData?.eventToEdit}
          patients={patients}
          users={users}
          events={events}
      />
      <ConfirmationModal
        isOpen={!!appointmentToDelete}
        onClose={() => setAppointmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isLoading}
        title="Confirmar Eliminación de Cita"
        message={`¿Estás seguro de que deseas eliminar la cita para "${appointmentToDelete?.motivo}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Agenda;