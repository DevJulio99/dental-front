import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const initialSchedule = {
  lunes: { enabled: false, availableTimes: [] },
  martes: { enabled: false, availableTimes: [] },
  miercoles: { enabled: false, availableTimes: [] },
  jueves: { enabled: false, availableTimes: [] },
  viernes: { enabled: false, availableTimes: [] },
  sabado: { enabled: false, availableTimes: [] },
  domingo: { enabled: false, availableTimes: [] },
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
  const { isLoading, get, put } = useApi();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [openDay, setOpenDay] = useState(null); // Estado para controlar el acordeón abierto
  const [allTimeSlots, setAllTimeSlots] = useState([]); // Estado para los horarios que vienen del servicio

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const tenantInfo = JSON.parse(localStorage.getItem('tenant'));
        const subdomain = tenantInfo?.subdominio;

        if (!subdomain) {
          toast.error('No se pudo identificar el consultorio. No se puede cargar la configuración.');
          return;
        }

        const possibleTimesResponse = await get(`/public/horarios-disponibles?subdomain=${subdomain}`);
        
        if (Array.isArray(possibleTimesResponse)) {
          // Extraemos solo la parte de la hora (HH:mm) y eliminamos duplicados.
          const uniqueTimes = [...new Set(possibleTimesResponse.map(timeString => timeString.split('T')[1].substring(0, 5)))];
          setAllTimeSlots(uniqueTimes.sort());
        }

        // TODO: Aquí se debería hacer una segunda llamada para cargar la configuración guardada.
        // Por ahora, el componente iniciará con la configuración por defecto.
        setSchedule(initialSchedule);

      } catch (err) {
        toast.error(err.message || 'No se pudo cargar la configuración del horario.');
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchSchedule();
  }, [get]);

  const handleEnabledChange = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleToggleAccordion = (day) => {
    setOpenDay(prevOpenDay => (prevOpenDay === day ? null : day));
  };

  const handleTimeSlotChange = (day, timeSlot) => {
    setSchedule(prev => {
      const currentTimes = prev[day].availableTimes;
      const newTimes = currentTimes.includes(timeSlot)
        ? currentTimes.filter(t => t !== timeSlot) // Si ya está, lo quitamos
        : [...currentTimes, timeSlot].sort(); // Si no está, lo añadimos y ordenamos
      return {
        ...prev,
        [day]: { ...prev[day], availableTimes: newTimes }
      };
    })
  };

  const handleSaveChanges = async () => {
    // try {
    //   const tenantInfo = JSON.parse(localStorage.getItem('tenant'));
    //   const subdomain = tenantInfo?.subdominio;

    //   if (!subdomain) {
    //     toast.error('No se pudo identificar el consultorio. No se pueden guardar los cambios.');
    //     return;
    //   }

    //   await put(`/Horarios/configuracion?subdomain=${subdomain}`, schedule);
    //   toast.success('Horario guardado correctamente.');
    // } catch (err) {
    //   toast.error(err.message || 'No se pudo guardar el horario.');
    // }
  };

  if (isPageLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Horarios</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Horario Semanal Laborable</h2>
        <div className="space-y-4">
          {Object.keys(schedule).map(day => (
            <div key={day} className="border rounded-md overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100" onClick={() => handleToggleAccordion(day)}>
                <div className="flex items-center">
                  <input type="checkbox" id={`check-${day}`} checked={schedule[day].enabled} onChange={() => handleEnabledChange(day)} onClick={(e) => e.stopPropagation()} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <label htmlFor={`check-${day}`} className="ml-3 font-medium text-gray-800 capitalize cursor-pointer">{dayNames[day]}</label>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${openDay === day ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>

              {openDay === day && (
                <div className={`p-4 border-t transition-opacity duration-500 ${schedule[day].enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {allTimeSlots.map(timeSlot => (
                      <div key={timeSlot}>
                        <input type="checkbox" id={`${day}-${timeSlot}`} value={timeSlot} checked={schedule[day].availableTimes.includes(timeSlot)} onChange={() => handleTimeSlotChange(day, timeSlot)} className="hidden peer" />
                        <label htmlFor={`${day}-${timeSlot}`} className="block w-full text-center text-sm p-2 border rounded-md cursor-pointer transition-colors peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:bg-gray-100">{timeSlot}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleSaveChanges} disabled={isLoading} className="px-6 py-2 font-bold text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">{isLoading ? 'Guardando...' : 'Guardar Cambios'}</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;