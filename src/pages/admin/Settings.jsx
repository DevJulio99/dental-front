import { useState, useEffect} from 'react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const getInitialSchedule = () => ({
  lunes: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
  martes: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
  miercoles: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
  jueves: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
  viernes: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
  sabado: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
  domingo: { enabled: false, morningStart: null, morningEnd: null, afternoonStart: null, afternoonEnd: null },
});

const dayNames = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

// Mapeo de dayOfWeek (API) a los nombres de día (estado local)
const dayOfWeekMap = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

// Función para convertir los datos de la API al formato del estado 'schedule'
const transformApiDataToSchedule = (apiData, allTimeSlots) => {
  const newSchedule = getInitialSchedule();

  apiData.forEach(dayConfig => {
    const dayName = dayOfWeekMap[dayConfig.dayOfWeek];
    if (dayName) {
      newSchedule[dayName].enabled = dayConfig.isWorkingDay;
      // Asigna directamente los valores de la API (o null si no existen)
      // La API devuelve "HH:mm:ss", nos quedamos con "HH:mm"
      newSchedule[dayName].morningStart = dayConfig.morningStartTime?.substring(0, 5) || null;
      newSchedule[dayName].morningEnd = dayConfig.morningEndTime?.substring(0, 5) || null;
      newSchedule[dayName].afternoonStart = dayConfig.afternoonStartTime?.substring(0, 5) || null;
      newSchedule[dayName].afternoonEnd = dayConfig.afternoonEndTime?.substring(0, 5) || null;
    }
  });

  return newSchedule;
};

// Función para generar todos los intervalos de tiempo posibles en un día
const generateTimeSlots = (intervalMinutes) => {
  if (!intervalMinutes || intervalMinutes <= 0) {
    return []; // Devuelve vacío si el intervalo no es válido
  }
  const slots = [];
  const date = new Date();
  date.setHours(0, 0, 0, 0); // Empezar a las 00:00

  for (let i = 0; i < (24 * 60) / intervalMinutes; i++) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    date.setMinutes(date.getMinutes() + intervalMinutes);
  }
  return slots;
};

// Función para convertir un string "HH:mm" a ticks de .NET TimeSpan
const timeToTicks = (timeString) => {
  if (!timeString) {
    return null;
  }
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalSeconds = (hours * 3600) + (minutes * 60);
  // 1 tick = 100 nanosegundos. 1 segundo = 10,000,000 ticks.
  const ticks = totalSeconds * 10000000;
  return { ticks };
};


const Settings = () => {
  const [schedule, setSchedule] = useState(getInitialSchedule());
  const { isLoading, get, post, put } = useApi();
  const [openDay, setOpenDay] = useState(null); // Estado para controlar el acordeón abierto
  const [allTimeSlots, setAllTimeSlots] = useState([]); // Estado para los horarios que vienen del servicio
  const [copySourceDay, setCopySourceDay] = useState(null); // Estado para el modal de copiar horario
  const [targetCopyDays, setTargetCopyDays] = useState([]); // Días a los que se copiará el horario
  const [users, setUsers] = useState([]); // Lista de odontólogos
  const [appointmentDuration, setAppointmentDuration] = useState(30); // Duración de la cita
  const [selectedUserId, setSelectedUserId] = useState(''); // Odontólogo seleccionado

  useEffect(() => {
    // 1. Cargar la lista de odontólogos para el selector. Se ejecuta solo una vez.
    const fetchUsers = async () => {
        try {
          const usersData = await get('/Usuarios');
          if (Array.isArray(usersData)) {
            const odontologos = usersData.filter(u => u.rol === 'Odontologo');
            setUsers(odontologos);
            // Si tenemos odontólogos, seleccionamos el primero por defecto.
            if (odontologos.length > 0) {
              setSelectedUserId(odontologos[0].id);
            }
          }
        } catch (err) {
          toast.error('No se pudo cargar la lista de odontólogos.');
        }
    };
    fetchUsers();
  }, [get]);

  useEffect(() => {
    // Carga el horario para el usuario seleccionado
    if (selectedUserId) {
      const fetchSchedule = async () => {
        try {
          const tenantInfo = JSON.parse(localStorage.getItem('tenant'));
          const subdomain = tenantInfo?.subdominio;
          if (!subdomain) {
            toast.error('No se pudo identificar el consultorio.');
            return;
          }
          const savedConfigResponse = await post('/public/listarConfiguracionHorarios', { subdomain, usuarioId: selectedUserId });
          if (Array.isArray(savedConfigResponse) && savedConfigResponse.length > 0) {
            const duration = savedConfigResponse[0]?.appointmentDuration || 30;
            setAppointmentDuration(duration);
            const generatedTimeSlots = generateTimeSlots(duration);
            setAllTimeSlots(generatedTimeSlots);
            const loadedSchedule = transformApiDataToSchedule(savedConfigResponse, generatedTimeSlots);
            setSchedule(loadedSchedule);
          } else {
            // Si no hay configuración, usamos valores por defecto
            const defaultDuration = 30;
            setAppointmentDuration(defaultDuration);
            setAllTimeSlots(generateTimeSlots(defaultDuration));
            setSchedule(getInitialSchedule());
          }
          
        } catch (err) {
          toast.error(err.message || 'No se pudo cargar la configuración del horario.');
        }
      };
      fetchSchedule();
    }
  }, [selectedUserId, post]);

  const handleEnabledChange = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleToggleAccordion = (day) => {
    setOpenDay(prevOpenDay => (prevOpenDay === day ? null : day));
  };

  const handleRangeChange = (day, shift, type, value) => {
    setSchedule(prev => {
      const daySchedule = prev[day];
      const key = `${shift}${type}`; // e.g., 'morningStart'

      // --- State Update ---
      const updatedDay = { ...daySchedule, [key]: value || null };

      // --- Auto-clearing Logic ---
      if (key === 'morningStart' && !value) {
        updatedDay.morningEnd = null;
        updatedDay.afternoonStart = null;
        updatedDay.afternoonEnd = null;
      }
      if (key === 'morningEnd' && !value) {
        updatedDay.afternoonStart = null;
        updatedDay.afternoonEnd = null;
      }
      if (key === 'afternoonStart' && !value) {
        updatedDay.afternoonEnd = null;
      }

      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const handleClearShift = (day, shift) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [`${shift}Start`]: null,
        [`${shift}End`]: null,
      }
    }));
  };

  const handleCopySchedule = () => {
    if (!copySourceDay || targetCopyDays.length === 0) return;

    const sourceConfig = schedule[copySourceDay];

    setSchedule(prev => {
      const newSchedule = { ...prev };
      targetCopyDays.forEach(day => {
        newSchedule[day] = {
          ...newSchedule[day], // Mantiene el estado 'enabled' del día de destino
          morningStart: sourceConfig.morningStart,
          morningEnd: sourceConfig.morningEnd,
          afternoonStart: sourceConfig.afternoonStart,
          afternoonEnd: sourceConfig.afternoonEnd,
        };
      });
      return newSchedule;
    });

    toast.success(`Horario de ${dayNames[copySourceDay]} copiado a ${targetCopyDays.length} día(s).`);
    setCopySourceDay(null); // Cierra el modal
  };

  const handleSaveChanges = async () => {
    try {
      const tenantInfo = JSON.parse(localStorage.getItem('tenant'));
      const subdomain = tenantInfo?.subdominio;

      if (!subdomain) {
        toast.error('No se pudo identificar el consultorio. No se pueden guardar los cambios.');
        return;
      }

      // Construir el payload en el nuevo formato
      const payload = {
        usuarioId: selectedUserId,
        configurations: Object.keys(schedule).map(dayName => {
          const dayConfig = schedule[dayName];
          return {
            dayOfWeek: dayOfWeekMap.indexOf(dayName),
            isWorkingDay: dayConfig.enabled,
            morningStartTime: timeToTicks(dayConfig.morningStart),
            morningEndTime: timeToTicks(dayConfig.morningEnd),
            afternoonStartTime: timeToTicks(dayConfig.afternoonStart),
            afternoonEndTime: timeToTicks(dayConfig.afternoonEnd),
            appointmentDuration: appointmentDuration,
          };
        })
      };

      // Llamar al nuevo endpoint con el nuevo payload
      await post('/ScheduleConfig/upsert', payload);
      toast.success('Horario guardado correctamente.');
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar el horario.');
    }
  };

  return ( // El spinner se mostrará aquí si isLoading es true
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Horarios</h1>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
          Configurando horario para:
        </label>
        <select
          id="user-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          disabled={users.length === 0}
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>{`${user.nombre} ${user.apellido}`}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (<div key={selectedUserId} className="p-6 bg-white rounded-lg shadow-md transition-opacity duration-300">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* --- Turno Mañana --- */}
                    <div>
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-600">Turno Mañana</h4>
                        <button onClick={() => handleClearShift(day, 'morning')} title="Limpiar turno mañana" className="ml-2 text-gray-400 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full">
                          <label htmlFor={`${day}-morning-start`} className="text-sm font-medium text-gray-700">Desde:</label>
                          <select id={`${day}-morning-start`} value={schedule[day].morningStart || ''} onChange={(e) => handleRangeChange(day, 'morning', 'Start', e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">--:--</option>
                            {allTimeSlots.map(time => <option key={`ms-${time}`} value={time}>{time}</option>)}
                          </select>
                        </div>
                        <div className="w-full">
                          <label htmlFor={`${day}-morning-end`} className="text-sm font-medium text-gray-700">Hasta:</label>
                          <select id={`${day}-morning-end`} value={schedule[day].morningEnd || ''} onChange={(e) => {
                              if (schedule[day].morningStart && e.target.value <= schedule[day].morningStart) {
                                toast.error('La hora de fin no puede ser anterior o igual a la de inicio.');
                                e.target.value = schedule[day].morningEnd || ''; // Revertir selección
                              } else {
                                handleRangeChange(day, 'morning', 'End', e.target.value);
                              }
                            }} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">--:--</option>
                            {allTimeSlots.map(time => (
                              <option key={`me-${time}`} value={time} disabled={schedule[day].morningStart && time <= schedule[day].morningStart}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* --- Turno Tarde --- */}
                    <div>
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-600">Turno Tarde</h4>
                        <button onClick={() => handleClearShift(day, 'afternoon')} title="Limpiar turno tarde" className="ml-2 text-gray-400 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full">
                          <label htmlFor={`${day}-afternoon-start`} className="text-sm font-medium text-gray-700">Desde:</label>
                          <select id={`${day}-afternoon-start`} value={schedule[day].afternoonStart || ''} onChange={(e) => {
                              if (schedule[day].morningEnd && e.target.value <= schedule[day].morningEnd) {
                                toast.error('El turno tarde no puede empezar antes de que termine el turno mañana.');
                                e.target.value = schedule[day].afternoonStart || ''; // Revertir selección
                              } else {
                                handleRangeChange(day, 'afternoon', 'Start', e.target.value);
                              }
                            }} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">--:--</option>
                            {allTimeSlots.map(time => (
                              <option key={`as-${time}`} value={time} disabled={schedule[day].morningEnd && time <= schedule[day].morningEnd}>{time}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full">
                          <label htmlFor={`${day}-afternoon-end`} className="text-sm font-medium text-gray-700">Hasta:</label>
                          <select id={`${day}-afternoon-end`} value={schedule[day].afternoonEnd || ''} onChange={(e) => {
                              if (schedule[day].afternoonStart && e.target.value <= schedule[day].afternoonStart) {
                                toast.error('La hora de fin no puede ser anterior o igual a la de inicio.');
                                e.target.value = schedule[day].afternoonEnd || ''; // Revertir selección
                              } else {
                                handleRangeChange(day, 'afternoon', 'End', e.target.value);
                              }
                            }} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="">--:--</option>
                            {allTimeSlots.map(time => (
                              <option key={`ae-${time}`} value={time} disabled={schedule[day].afternoonStart && time <= schedule[day].afternoonStart}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => { setCopySourceDay(day); setTargetCopyDays([]); }}
                      className="text-sm text-primary hover:underline focus:outline-none">
                      Copiar horario...
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleSaveChanges} disabled={isLoading} className="px-6 py-2 font-bold text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">{isLoading ? 'Guardando...' : 'Guardar Cambios'}</button>
        </div>
      </div>)}
      {/* Modal para Copiar Horario */}
      {copySourceDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Copiar horario de {dayNames[copySourceDay]}</h3>
            <p className="mb-4 text-sm text-gray-600">Selecciona los días a los que deseas aplicar esta configuración de horario.</p>
            <div className="text-right mb-2">
              <button
                onClick={() => {
                  const allOtherDays = Object.keys(dayNames).filter(d => d !== copySourceDay);
                  if (targetCopyDays.length === allOtherDays.length) {
                    setTargetCopyDays([]); // Deseleccionar todos
                  } else {
                    setTargetCopyDays(allOtherDays); // Seleccionar todos
                  }
                }} className="text-sm font-medium text-primary hover:underline">Seleccionar/Deseleccionar todos</button>
            </div>
            <div className="space-y-2">
              {Object.keys(dayNames).filter(d => d !== copySourceDay).map(dayKey => (
                <div key={`copy-target-${dayKey}`} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`copy-check-${dayKey}`}
                    checked={targetCopyDays.includes(dayKey)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTargetCopyDays(prev => [...prev, dayKey]);
                      } else {
                        setTargetCopyDays(prev => prev.filter(d => d !== dayKey));
                      }
                    }}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <label htmlFor={`copy-check-${dayKey}`} className="ml-2 text-gray-700">{dayNames[dayKey]}</label>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button onClick={() => setCopySourceDay(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                Cancelar
              </button>
              <button
                onClick={handleCopySchedule}
                disabled={targetCopyDays.length === 0}
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;