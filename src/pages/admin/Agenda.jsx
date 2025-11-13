import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import AppointmentModal from '../../components/admin/AppointmentModal';

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

// Datos de ejemplo para las citas. En una aplicación real, vendrían de la API.
const sampleEvents = [
  {
    id: 1,
    title: 'Limpieza - Juan Pérez García',
    start: new Date(2024, 6, 29, 10, 0, 0), // Los meses son 0-indexados (6 = Julio)
    end: new Date(2024, 6, 29, 10, 30, 0),
    treatments: ['Limpieza Dental'],
    observations: 'Paciente presenta sensibilidad en molares inferiores.',
    resourceId: 1, // ID del odontólogo
  },
  {
    id: 2,
    title: 'Revisión - María López Fernández',
    start: new Date(2024, 6, 30, 12, 0, 0),
    end: new Date(2024, 6, 30, 12, 45, 0),
    treatments: [],
    observations: '',
    resourceId: 2,
  },
];

// Horario de trabajo simulado. En una app real, esto vendría de la API
// basado en la configuración que acabamos de crear.
const workDayStart = new Date();
workDayStart.setHours(9, 0, 0, 0);
const workDayEnd = new Date();
workDayEnd.setHours(18, 0, 0, 0);

const Agenda = () => {
  const [events, setEvents] = useState(sampleEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // Guardará slotInfo o el evento a editar

  // Esta función se dispara al hacer clic en una cita existente
  const handleSelectEvent = (event) => {
    // Abrimos el modal en modo edición, pasando el evento seleccionado
    setModalData({ eventToEdit: event });
    setIsModalOpen(true);
  };

  // Esta función se dispara al seleccionar un rango de tiempo vacío en el calendario
  const handleSelectSlot = (slotInfo) => {
    // Abrimos el modal en modo creación, pasando la info del slot
    setModalData({ slotInfo });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleSaveAppointment = (newAppointmentData) => {
    if (newAppointmentData.id) {
      // Lógica de Edición
      setEvents(events.map(event => 
        event.id === newAppointmentData.id ? { ...event, ...newAppointmentData } : event // Sobrescribe el evento con los nuevos datos
      ));
      toast.success(`Cita para "${newAppointmentData.title}" actualizada.`);
      console.log('Cita actualizada:', newAppointmentData);
    } else {
      // Lógica de Creación
      const newEvent = {
        // Aquí se añadirían los nuevos campos al crear
        ...newAppointmentData,
        id: events.length + 1, // ID simple para el ejemplo
      };
      setEvents([...events, newEvent]);
      toast.success(`Cita para "${newAppointmentData.title}" agendada.`);
    }
    handleCloseModal();
  };

  return (
    <div className="h-[calc(100vh-8rem)]"> {/* Ajusta la altura para que ocupe el espacio disponible */}
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
        onSelectSlot={handleSelectSlot}
        selectable // Permite la selección de slots
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
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          noEventsInRange: "No hay citas en este rango.",
        }}
      />
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
        slotInfo={modalData?.slotInfo}
        eventToEdit={modalData?.eventToEdit}
      />
    </div>
  );
};

export default Agenda;