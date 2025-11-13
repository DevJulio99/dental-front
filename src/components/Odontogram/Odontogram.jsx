import React, { useState } from 'react';
import Tooth from './Tooth';
import toast from 'react-hot-toast';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';

// Nueva estructura de datos con historial. En la vida real, esto vendría de la API.
const initialTeethData = {
  18: [{ date: '2024-01-10', status: 'sano' }],
  17: [{ date: '2023-11-05', status: 'caries' }, { date: '2024-07-28', status: 'curado' }],
  16: [{ date: '2024-05-15', status: 'pendiente' }],
  15: [{ date: '2024-01-10', status: 'sano' }], 14: [{ date: '2024-01-10', status: 'sano' }], 13: [{ date: '2024-01-10', status: 'sano' }], 12: [{ date: '2024-01-10', status: 'sano' }], 11: [{ date: '2024-01-10', status: 'sano' }],
  21: [{ date: '2024-01-10', status: 'sano' }], 22: [{ date: '2024-01-10', status: 'sano' }], 23: [{ date: '2024-01-10', status: 'sano' }], 24: [{ date: '2024-01-10', status: 'caries' }], 25: [{ date: '2024-01-10', status: 'sano' }], 26: [{ date: '2024-01-10', status: 'sano' }], 27: [{ date: '2024-01-10', status: 'sano' }], 28: [{ date: '2024-01-10', status: 'sano' }],
  48: [{ date: '2023-09-20', status: 'extraido' }],
  47: [{ date: '2024-01-10', status: 'sano' }], 46: [{ date: '2024-01-10', status: 'sano' }], 45: [{ date: '2024-01-10', status: 'sano' }], 44: [{ date: '2024-01-10', status: 'sano' }], 43: [{ date: '2024-01-10', status: 'sano' }], 42: [{ date: '2024-01-10', status: 'sano' }], 41: [{ date: '2024-01-10', status: 'sano' }],
  31: [{ date: '2024-01-10', status: 'sano' }], 32: [{ date: '2024-01-10', status: 'sano' }], 33: [{ date: '2024-01-10', status: 'sano' }], 34: [{ date: '2024-01-10', status: 'sano' }], 35: [{ date: '2024-01-10', status: 'sano' }],
  36: [{ date: '2023-08-01', status: 'pendiente' }, { date: '2024-02-14', status: 'curado' }],
  37: [{ date: '2024-01-10', status: 'sano' }], 38: [{ date: '2024-01-10', status: 'sano' }],
};

const statusOptions = [
  { id: 'sano', label: 'Sano', color: 'bg-green-500' },
  { id: 'curado', label: 'Curado', color: 'bg-blue-500' },
  { id: 'pendiente', label: 'Pendiente', color: 'bg-yellow-400' },
  { id: 'caries', label: 'Caries', color: 'bg-purple-500' },
  { id: 'extraido', label: 'Extraído', color: 'bg-red-500' },
];

const Odontogram = ({ patientId }) => {
  const [teeth, setTeeth] = useState(initialTeethData);
  const [selectedStatus, setSelectedStatus] = useState('sano');
  const [changeDate, setChangeDate] = useState(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isChangeDateEnabled, setIsChangeDateEnabled] = useState(false);
  
const handleToothClick = (toothNumber) => {
  // No permitir clics si estamos en modo historial
  if (isViewingHistory) return;

  // Lógica para añadir un nuevo estado al historial del diente
    const newStatusEntry = { date: changeDate, status: selectedStatus };

    // Aquí harías la llamada a la API para guardar el nuevo estado:
    // api.post(`/patients/${patientId}/odontogram/updates`, { toothNumber, status: selectedStatus, date: changeDate });
    console.log(`Guardando nuevo estado para diente ${toothNumber}:`, newStatusEntry);

    // Mostramos una notificación de éxito para dar feedback claro al usuario
    const formattedDate = new Date(changeDate + 'T00:00:00').toLocaleDateString();
    toast.success(`Diente ${toothNumber}: '${selectedStatus}' registrado en fecha ${formattedDate}.`);

    setTeeth(prevTeeth => {
      const toothHistory = prevTeeth[toothNumber] ? [...prevTeeth[toothNumber]] : [];
      
      // Añadimos la nueva entrada y ordenamos por fecha para mantener la consistencia
      toothHistory.push(newStatusEntry);
      toothHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        ...prevTeeth,
        [toothNumber]: toothHistory,
      };
    });
}

// Función para obtener el estado actual de un diente (el último en su historial)
  const getCurrentStatus = (toothHistory) => {
    if (!toothHistory || toothHistory.length === 0) {
      return 'sano'; // Estado por defecto si no hay historial
    }
    // El historial está ordenado, así que el último es el más reciente.
    return toothHistory[toothHistory.length - 1].status;
  };

  // Función para obtener el estado de un diente en una fecha específica
  const getStatusAtDate = (toothHistory, date) => {
    if (!toothHistory || toothHistory.length === 0) {
      return 'sano';
    }

    // Filtra las entradas del historial que son anteriores o iguales a la fecha de visualización
    const relevantHistory = toothHistory.filter(entry => new Date(entry.date) <= new Date(date));

    if (relevantHistory.length === 0) {
      // Si no hay historial antes de esa fecha, se asume un estado inicial (ej. 'sano')
      return 'sano';
    }

    // El último elemento del historial filtrado es el estado correcto en esa fecha
    return relevantHistory[relevantHistory.length - 1].status;
  };

  const renderQuadrant = (start, end, reverse = false) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    if (reverse) range.reverse();
    return range.map(num => (
      <Tooth 
        key={num} 
        number={num} 
        // Si estamos en modo historial, obtenemos el estado en esa fecha, si no, el actual.
        status={isViewingHistory ? getStatusAtDate(teeth[num], viewDate) : getCurrentStatus(teeth[num])}
        onClick={() => handleToothClick(num)} 
      />
    ));
  };

  const handleToggleChangeDate = () => {
    setIsChangeDateEnabled(!isChangeDateEnabled);
    // Si se vuelve a deshabilitar, reseteamos a la fecha actual para seguridad
    if (isChangeDateEnabled) {
      setChangeDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="odontogram-container">
      <div className="flex items-center gap-4 mb-4 p-2 rounded-md bg-gray-100">
        <div className="flex items-center">
          <input id="history-mode" type="checkbox" checked={isViewingHistory} onChange={() => setIsViewingHistory(!isViewingHistory)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
          <label htmlFor="history-mode" className="ml-2 text-sm font-medium text-gray-900">Modo Historial</label>
        </div>
        {isViewingHistory && (
          <div className="flex items-center gap-2">
            <label htmlFor="viewDate" className="font-medium text-sm">Ver estado en fecha:</label>
            <input 
              type="date" 
              id="viewDate" 
              value={viewDate} 
              onChange={(e) => setViewDate(e.target.value)}
              className="px-2 py-1 border rounded-md text-sm"
            />
          </div>
        )}
      </div>

      {/* Controles de Edición */}
      <div className={`transition-opacity duration-300 ${isViewingHistory ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} aria-hidden={isViewingHistory}>
        <div className="flex items-center gap-4 mb-4 p-2 rounded-md bg-gray-100">
          <label htmlFor="changeDate" className="font-medium text-sm">Fecha del Registro:</label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              id="changeDate" 
              value={changeDate} 
              onChange={(e) => setChangeDate(e.target.value)}
              disabled={!isChangeDateEnabled}
              className="px-2 py-1 border rounded-md text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
            <button onClick={handleToggleChangeDate} title={isChangeDateEnabled ? "Bloquear fecha (usar fecha actual)" : "Cambiar fecha de registro"} className="p-1 rounded-md hover:bg-gray-300">
              <CalendarIcon className={`w-5 h-5 ${isChangeDateEnabled ? 'text-primary' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 p-2 rounded-md bg-gray-100">
          <strong className="mr-2">Estado a aplicar:</strong>
          {statusOptions.map(opt => (
            <button 
              key={opt.id}
              onClick={() => setSelectedStatus(opt.id)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${selectedStatus === opt.id ? `${opt.color} text-white shadow-md` : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 text-center text-xs text-gray-500">
        {/* Cuadrantes Superiores */}
        <div className="flex justify-center gap-1">{renderQuadrant(11, 18, true)}</div>
        <div className="flex justify-center gap-1">{renderQuadrant(21, 28)}</div>

        {/* Cuadrantes Inferiores */}
        <div className="flex justify-center gap-1">{renderQuadrant(41, 48, true)}</div>
        <div className="flex justify-center gap-1">{renderQuadrant(31, 38)}</div>
      </div>
    </div>
  );
};

export default Odontogram;