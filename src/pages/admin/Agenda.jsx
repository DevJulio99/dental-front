import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // ¡Importación clave!
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { isBefore, startOfToday } from 'date-fns';
import es from 'date-fns/locale/es';
import AppointmentModal from '../../components/admin/AppointmentModal';
import { useApi } from '../../hooks/useApi';

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

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const { isLoading, get, post, put } = useApi();
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // Guardará slotInfo o el evento a editar
  const [currentDate, setCurrentDate] = useState(new Date()); // Estado para la fecha actual del calendario

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

        if (Array.isArray(citasData)) {
          const formattedEvents = citasData.map(cita => ({
            id: cita.id, // Propiedad requerida por el calendario
            title: `${cita.motivo} - ${cita.pacienteNombre}`,
            start: new Date(cita.fechaHora),
            end: new Date(`${cita.appointmentDate}T${cita.endTime}`),
            ...cita,
          }));
          setEvents(formattedEvents);
        }
        if (Array.isArray(patientsData)) setPatients(patientsData);
        if (Array.isArray(usersData)) setUsers(usersData.filter(u => u.rol === 'Odontologo'));
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
    // Abrimos el modal en modo edición, pasando el evento seleccionado
    setModalData({ eventToEdit: event });
    setIsModalOpen(true);
  };

  // Esta función se dispara al seleccionar un rango de tiempo vacío en el calendario
  const handleSelectSlot = (slotInfo) => {
    console.log('slotInfo:', slotInfo);
    // Validamos que no se puedan crear citas en el pasado.
    if (isBefore(slotInfo.start, startOfToday())) {
      toast.error('No se pueden agendar citas en fechas pasadas.');
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

  const handleSaveAppointment = async (eventDataForUI) => {
    try {
      const { id, ...payload } = eventDataForUI;
      if (id) {
        // Lógica de Edición (PUT)
        const updatedAppointment = await put(`/Citas/${id}`, payload);
        
        // Actualizamos el evento en la lista del calendario
        setEvents(events.map(event => 
          event.id === id ? eventDataForUI : event
        ));
        toast.success(`Cita para "${eventDataForUI.title}" actualizada.`);
      } else {
        // Lógica de Creación (POST)
        const newAppointment = await post('/Citas', payload);
        
        // Añadimos el nuevo evento a la lista del calendario
        const newEventForUI = {
          ...eventDataForUI, // Mantenemos los datos para la UI
          id: newAppointment.id, // Usamos el ID devuelto por la API
        };
        setEvents([...events, newEventForUI]);
        toast.success(`Cita para "${newEventForUI.title}" agendada.`);
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar la cita.');
    }
  };

  if (isListLoading) {
    return <div className="flex items-center justify-center h-full">Cargando agenda...</div>;
  }

  if (listError) {
    return <div className="flex items-center justify-center h-full text-red-500">{listError}</div>;
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]"> {/* Contenedor ÚNICO con altura y posición relativa */}
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
          slotInfo={modalData?.slotInfo}
          eventToEdit={modalData?.eventToEdit}
        patients={patients}
        users={users}
        isSaving={isLoading}
      />
    </div>
  );
};

export default Agenda;