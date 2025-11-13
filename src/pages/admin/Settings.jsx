import React, { useState } from 'react';
import toast from 'react-hot-toast';

const initialSchedule = {
  lunes: { enabled: true, start: '09:00', end: '18:00' },
  martes: { enabled: true, start: '09:00', end: '18:00' },
  miercoles: { enabled: true, start: '09:00', end: '18:00' },
  jueves: { enabled: true, start: '09:00', end: '18:00' },
  viernes: { enabled: true, start: '09:00', end: '17:00' },
  sabado: { enabled: false, start: '10:00', end: '14:00' },
  domingo: { enabled: false, start: '09:00', end: '18:00' },
};

const dayNames = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const Settings = () => {
  const [schedule, setSchedule] = useState(initialSchedule);

  const handleEnabledChange = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleTimeChange = (day, type, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
  };

  const handleSaveChanges = () => {
    // En una aplicación real, aquí harías una llamada a la API para guardar `schedule`
    console.log('Guardando horario:', schedule);
    toast.success('Horario guardado correctamente.');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Horarios</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Horario Semanal Laborable</h2>
        <div className="space-y-4">
          {Object.keys(schedule).map(day => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-3 border rounded-md">
              <div className="flex items-center md:col-span-1">
                <input type="checkbox" id={`check-${day}`} checked={schedule[day].enabled} onChange={() => handleEnabledChange(day)} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                <label htmlFor={`check-${day}`} className="ml-3 font-medium text-gray-800 capitalize">{dayNames[day]}</label>
              </div>
              <div className="flex items-center gap-2 md:col-span-3">
                <label htmlFor={`start-${day}`} className="text-sm">Desde:</label>
                <input type="time" id={`start-${day}`} value={schedule[day].start} onChange={(e) => handleTimeChange(day, 'start', e.target.value)} disabled={!schedule[day].enabled} className="px-2 py-1 border rounded-md text-sm disabled:bg-gray-200 disabled:cursor-not-allowed" />
                <label htmlFor={`end-${day}`} className="text-sm">Hasta:</label>
                <input type="time" id={`end-${day}`} value={schedule[day].end} onChange={(e) => handleTimeChange(day, 'end', e.target.value)} disabled={!schedule[day].enabled} className="px-2 py-1 border rounded-md text-sm disabled:bg-gray-200 disabled:cursor-not-allowed" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleSaveChanges} className="px-6 py-2 font-bold text-white rounded-md bg-primary hover:bg-blue-600">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;