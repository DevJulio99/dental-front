import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import Tooth from './Tooth';
import ToothDetailModal from './ToothDetailModal';
import ToothUpdateModal from './ToothUpdateModal';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';
import './Odontogram.scss';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

// Todos los estados disponibles
const statusOptions = [
  { id: 'sano', label: 'Sano', color: 'bg-white border-gray-400 text-gray-700' },
  { id: 'curado', label: 'Curado', color: 'bg-blue-500 text-white' },
  { id: 'pendiente', label: 'Pendiente', color: 'bg-yellow-400 text-white' },
  { id: 'caries', label: 'Caries', color: 'bg-purple-500 text-white' },
  { id: 'extraido', label: 'Extraído', color: 'bg-red-500 text-white' },
  { id: 'endodoncia', label: 'Endodoncia', color: 'bg-cyan-500 text-white' },
  { id: 'corona', label: 'Corona', color: 'bg-amber-500 text-white' },
  { id: 'implante', label: 'Implante', color: 'bg-emerald-500 text-white' },
  { id: 'fracturado', label: 'Fracturado', color: 'bg-orange-500 text-white' },
  { id: 'a_extraer', label: 'A Extraer', color: 'bg-red-600 text-white' },
  { id: 'puente', label: 'Puente', color: 'bg-violet-500 text-white' },
];

// Todos los números de dientes válidos
const ALL_TEETH = [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28,
                   31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48];

const Odontogram = ({ patientId }) => {
  const { get, post, isLoading } = useApi();
  
  // Estados principales
  const [estadosDientes, setEstadosDientes] = useState({});
  const [historialAgrupado, setHistorialAgrupado] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de UI
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothToUpdate, setToothToUpdate] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  // Cargar estado actual de los dientes
  const loadEstadoActual = useCallback(async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await get(`/Odontogramas/paciente/${patientId}/estado-actual`);
      
      // Convertir el diccionario a un formato más manejable
      const estados = {};
      ALL_TEETH.forEach(toothNum => {
        const registro = data[toothNum];
        estados[toothNum] = registro ? registro.estado : 'sano';
      });
      
      setEstadosDientes(estados);
    } catch (err) {
      setError('Error al cargar el estado de los dientes');
      toast.error('Error al cargar el odontograma');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [patientId, get]);

  // Cargar historial agrupado
  const loadHistorialAgrupado = useCallback(async () => {
    if (!patientId) return;
    
    try {
      const data = await get(`/Odontogramas/paciente/${patientId}/historial-agrupado`);
      setHistorialAgrupado(data || {});
    } catch (err) {
      console.error('Error al cargar historial agrupado:', err);
    }
  }, [patientId, get]);

  // Cargar estado en fecha específica
  const loadEstadoEnFecha = useCallback(async (fecha) => {
    if (!patientId || !fecha) return;
    
    try {
      const fechaLocal = new Date(fecha.replace(/-/g, '/'));
      const data = await get(`/Odontogramas/paciente/${patientId}/estado-en-fecha?fecha=${format(fechaLocal, 'yyyy-MM-dd')}`);
      
      const estados = {};
      ALL_TEETH.forEach(toothNum => {
        const registro = data[toothNum];
        estados[toothNum] = registro ? registro.estado : 'sano';
      });
      
      setEstadosDientes(estados);
    } catch (err) {
      toast.error('Error al cargar el estado en la fecha seleccionada');
      console.error(err);
    }
  }, [patientId, get]);

  // Efecto inicial
  useEffect(() => {
    if (patientId) {
      loadEstadoActual();
      loadHistorialAgrupado();
    }
  }, [patientId, loadEstadoActual, loadHistorialAgrupado]);

  // Efecto para modo historial
  useEffect(() => {
    if (isViewingHistory && viewDate) {
      loadEstadoEnFecha(viewDate);
    } else if (!isViewingHistory) {
      loadEstadoActual();
    }
  }, [isViewingHistory, viewDate, loadEstadoEnFecha, loadEstadoActual]);

  const handleToothClick = (toothNumber) => {
    if (isViewingHistory) {
      setSelectedTooth(toothNumber);
      return;
    }
    // En modo edición, abre el modal de actualización
    setToothToUpdate(toothNumber);
  };

  const handleDoubleClick = (toothNumber) => {
    // El doble clic siempre abre el historial
    setSelectedTooth(toothNumber);
  };

  const handleUpdateStatus = async (toothNumber, status, observaciones, fecha) => {
    try {
      await post('/Odontogramas', {
        pacienteId: patientId,
        numeroDiente: toothNumber,
        estado: status,
        observaciones: observaciones.trim() || null,
        fechaRegistroDateTime: fecha,
      });

      const fechaFormateada = format(new Date(fecha + 'T00:00:00'), 'dd/MM/yyyy', { locale: es });
      toast.success(`Diente ${toothNumber}: estado "${statusOptions.find(s => s.id === status)?.label}" registrado el ${fechaFormateada}`);

      // Recargar datos
      await loadEstadoActual();
      await loadHistorialAgrupado();
      
      // Cerrar el modal
      setToothToUpdate(null);
    } catch (err) {
      toast.error('Error al guardar el estado del diente');
      console.error(err);
    }
  };

  // Obtener estado de un diente
  const getToothStatus = (toothNumber) => {
    return estadosDientes[toothNumber] || 'sano';
  };

  // Verificar si un diente tiene historial
  const hasHistory = (toothNumber) => {
    const historial = historialAgrupado[toothNumber];
    return historial && historial.length > 0;
  };

  // Renderizar cuadrante
  const renderQuadrant = (start, end, reverse = false, label = '') => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    if (reverse) range.reverse();
    
    return (
      <div className="flex flex-col items-center">
        {label && (
          <div className="text-xs font-semibold text-gray-600 mb-2">{label}</div>
        )}
        <div className="flex justify-center gap-3 flex-wrap">
          {range.map(num => (
            <Tooth
              key={num}
              number={num}
              status={getToothStatus(num)}
              onClick={() => handleToothClick(num)}
              onDoubleClick={() => handleDoubleClick(num)}
              hasHistory={hasHistory(num)}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleHistoryToggle = (checked) => {
    setIsViewingHistory(checked);
    if (!checked) {
      setViewDate(new Date().toISOString().split('T')[0]);
      loadEstadoActual();
    }
  };

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadEstadoActual}
          className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="odontogram-container">
      {/* Header con título y controles principales */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Odontograma Dental
            </h3>
            <p className="text-sm text-gray-600 mt-1">Visualiza y gestiona el estado dental del paciente</p>
          </div>
          
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showLegend ? 'Ocultar' : 'Mostrar'} Leyenda
          </button>
        </div>

        {/* Controles superiores mejorados */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg border border-primary-200 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <input
                id="history-mode"
                type="checkbox"
                checked={isViewingHistory}
                onChange={(e) => handleHistoryToggle(e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="history-mode" className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Modo Historial
              </label>
            </div>
            
            {isViewingHistory && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <label htmlFor="viewDate" className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  Ver estado en fecha:
                </label>
                <input
                  type="date"
                  id="viewDate"
                  value={viewDate}
                  onChange={(e) => {
                    console.log('e.target.value:', e.target.value);
                    setViewDate(e.target.value)
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>

          {!isViewingHistory && (
            <div className="text-xs text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <span className="font-semibold">💡 Tip:</span> Haz clic en un diente para actualizar su estado o doble clic para ver su historial.
            </div>
          )}
        </div>
      </div>

      {/* Leyenda mejorada */}
      {showLegend && (
        <div className="mb-6 p-5 bg-white border-2 border-gray-200 rounded-xl shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-bold text-gray-900">Guía de Estados del Odontograma</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {statusOptions.map(opt => (
              <div 
                key={opt.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className={`w-6 h-6 rounded-md ${opt.color} border-2 ${opt.id === 'sano' ? 'border-gray-400' : 'border-transparent'} shadow-sm flex-shrink-0`}></div>
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Odontograma mejorado */}
      <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg">
        {/* Indicador visual de orientación */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-xs font-semibold text-gray-700">Vista desde el dentista</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          {/* Cuadrantes Superiores */}
          <div className="space-y-6">
            <div className="bg-primary-500 px-4 py-2 rounded-lg border border-primary-300">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Superior Derecho
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {renderQuadrant(11, 18, true)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-primary-500 px-4 py-2 rounded-lg border border-primary-300">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Superior Izquierdo
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {renderQuadrant(21, 28)}
            </div>
          </div>

          {/* Cuadrantes Inferiores */}
          <div className="space-y-6">
            <div className="bg-primary-500 px-4 py-2 rounded-lg border border-primary-300">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Inferior Derecho
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {renderQuadrant(41, 48, true)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-primary-500 px-4 py-2 rounded-lg border border-primary-300">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Inferior Izquierdo
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {renderQuadrant(31, 38)}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles del diente */}
      {selectedTooth && (
        <ToothDetailModal
          isOpen={!!selectedTooth}
          onClose={() => setSelectedTooth(null)}
          patientId={patientId}
          toothNumber={selectedTooth}
          onUpdate={() => {
            loadEstadoActual();
            loadHistorialAgrupado();
          }}
        />
      )}

      {/* Modal para actualizar estado del diente */}
      {toothToUpdate && (
        <ToothUpdateModal
          isOpen={!!toothToUpdate}
          onClose={() => setToothToUpdate(null)}
          toothNumber={toothToUpdate}
          onUpdate={handleUpdateStatus}
          isSaving={isLoading}
        />
      )}
    </div>
  );
};

export default Odontogram;
