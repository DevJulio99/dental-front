import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import toast from 'react-hot-toast';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import PublicAppointmentModal from './PublicAppointmentModal';

// --- Simulación de datos que vendrían de la API para un consultorio específico ---

// Horario de trabajo del consultorio
const schedule = {
  lunes: { enabled: true, start: '09:00', end: '18:00' },
  martes: { enabled: true, start: '09:00', end: '18:00' },
  miercoles: { enabled: true, start: '09:00', end: '18:00' },
  jueves: { enabled: true, start: '09:00', end: '18:00' },
  viernes: { enabled: true, start: '09:00', end: '17:00' },
  sabado: { enabled: false, start: '10:00', end: '14:00' },
  domingo: { enabled: false, start: '09:00', end: '18:00' },
};

// Citas ya agendadas
const existingAppointments = [
  {
    start: new Date(2024, 6, 29, 10, 0, 0), // Los meses son 0-indexados (6 = Julio)
    end: new Date(2024, 6, 29, 10, 30, 0),
  },
  {
    start: new Date(2024, 6, 30, 12, 0, 0),
    end: new Date(2024, 6, 30, 12, 45, 0),
  },
];
// --- Fin de la simulación ---

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const dayMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const PublicBooking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { min, max } = useMemo(() => {
    let minHour = 24;
    let maxHour = 0;
    Object.values(schedule).forEach(day => {
      if (day.enabled) {
        minHour = Math.min(minHour, parseInt(day.start.split(':')[0], 10));
        maxHour = Math.max(maxHour, parseInt(day.end.split(':')[0], 10));
      }
    });
    const minTime = new Date();
    minTime.setHours(minHour, 0, 0, 0);
    const maxTime = new Date();
    maxTime.setHours(maxHour, 0, 0, 0);
    return { min: minTime, max: maxTime };
  }, []);

  const slotPropGetter = (date) => {
    const dayName = dayMap[date.getDay()];
    const daySchedule = schedule[dayName];
    const now = new Date();

    // **NUEVO: Comprobar si el slot es en el pasado**
    if (date < now) {
      return {
        className: 'bg-gray-200 cursor-not-allowed',
      };
    }

    // Comprobar si el día está deshabilitado
    if (!daySchedule.enabled) {
      return {
        className: 'bg-gray-200 cursor-not-allowed',
        style: {
          backgroundColor: '#f3f4f6',
        },
      };
    }

    // Comprobar si está fuera del horario laboral
    const slotTime = date.getHours() + date.getMinutes() / 60;
    const startTime = parseInt(daySchedule.start.split(':')[0], 10) + parseInt(daySchedule.start.split(':')[1], 10) / 60;
    const endTime = parseInt(daySchedule.end.split(':')[0], 10) + parseInt(daySchedule.end.split(':')[1], 10) / 60;

    if (slotTime < startTime || slotTime >= endTime) {
      return {
        className: 'bg-gray-200 cursor-not-allowed',
        style: {
          backgroundColor: '#f3f4f6',
        },
      };
    }

    return {}; // Slot disponible
  };

  const handleSelectSlot = (slotInfo) => {
    // **NUEVO: Evitar selección de slots en el pasado**
    const now = new Date();
    if (slotInfo.start < now) {
      return;
    }

    // **NUEVO: Comprobar si el día está habilitado en el horario**
    const dayName = dayMap[slotInfo.start.getDay()];
    const daySchedule = schedule[dayName];

    if (!daySchedule || !daySchedule.enabled) {
      toast.error('Este día no está disponible para agendar citas.');
      return; // No hacer nada si el día está deshabilitado
    }

    // (Opcional pero recomendado) Comprobar si el slot está dentro del horario laboral
    // Esto es una doble seguridad por si el `slotPropGetter` falla o no se aplica.

    setSelectedSlot(slotInfo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleConfirmBooking = (patientData) => {
    // En una aplicación real, aquí harías una llamada a la API para guardar la cita
    console.log('Reservando cita para:', patientData);
    toast.success(`¡Cita reservada con éxito para ${patientData.fullName}!`);
    handleCloseModal();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-secondary mb-4">Reservar Cita</h1>
        <p className="text-center text-gray-600 mb-6">Seleccione un horario disponible en el calendario.</p>
        <div className="h-[70vh]">
          <Calendar
            localizer={localizer}
            events={existingAppointments} // Mostramos las citas existentes para bloquear los slots
            defaultView="week"
            views={['week', 'day']}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            culture='es'
            min={min}
            max={max}
            selectable
            onSelectSlot={handleSelectSlot}
            slotPropGetter={slotPropGetter}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              noEventsInRange: "No hay citas en este rango.",
            }}
          />
        </div>
      </div>
      {/* El componente del modal que faltaba */}
      <PublicAppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBooking}
        slotInfo={selectedSlot}
      />
    </div>
  );
};

export default PublicBooking;