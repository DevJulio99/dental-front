import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import Tooth from './Tooth';
import ToothDetailModal from './ToothDetailModal';
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
  const [selectedStatus, setSelectedStatus] = useState('sano');
  const [changeDate, setChangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isChangeDateEnabled, setIsChangeDateEnabled] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [selectedTooth, setSelectedTooth] = useState(null);
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
      const fechaFormatted = format(new Date(fecha), 'yyyy-MM-dd');
      const data = await get(`/Odontogramas/paciente/${patientId}/estado-en-fecha?fecha=${fechaFormatted}`);
      
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

  // Manejar clic en diente
  const handleToothClick = async (toothNumber, isDoubleClick = false) => {
    // Si es doble clic, siempre abrir modal de historial
    if (isDoubleClick) {
      setSelectedTooth(toothNumber);
      return;
    }

    if (isViewingHistory) {
      // En modo historial, abrir modal con detalles
      setSelectedTooth(toothNumber);
      return;
    }

    // Validar fecha
    const fechaSeleccionada = isChangeDateEnabled ? changeDate : new Date().toISOString().split('T')[0];
    const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaObj > hoy) {
      toast.error('No se pueden registrar fechas futuras');
      return;
    }

    try {
      await post('/Odontogramas', {
        pacienteId: patientId,
        numeroDiente: toothNumber,
        estado: selectedStatus,
        observaciones: observaciones.trim() || null,
        fechaRegistroDateTime: fechaSeleccionada,
      });

      const fechaFormateada = format(fechaObj, 'dd/MM/yyyy', { locale: es });
      toast.success(`Diente ${toothNumber}: estado "${statusOptions.find(s => s.id === selectedStatus)?.label}" registrado el ${fechaFormateada}`);

      // Recargar datos
      await loadEstadoActual();
      await loadHistorialAgrupado();
      
      // Limpiar observaciones
      setObservaciones('');
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
              onClick={() => handleToothClick(num, false)}
              onDoubleClick={() => handleToothClick(num, true)}
              hasHistory={hasHistory(num)}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleToggleChangeDate = () => {
    setIsChangeDateEnabled(!isChangeDateEnabled);
    if (!isChangeDateEnabled) {
      setChangeDate(new Date().toISOString().split('T')[0]);
    }
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
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
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
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Odontograma Dental
            </h3>
            <p className="text-sm text-gray-600 mt-1">Visualiza y gestiona el estado dental del paciente</p>
          </div>
          
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showLegend ? 'Ocultar' : 'Mostrar'} Leyenda
          </button>
        </div>

        {/* Controles superiores mejorados */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <input
                id="history-mode"
                type="checkbox"
                checked={isViewingHistory}
                onChange={(e) => handleHistoryToggle(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
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
                  onChange={(e) => setViewDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
          </div>

          {!isViewingHistory && (
            <div className="text-xs text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <span className="font-semibold">💡 Tip:</span> Selecciona un estado y haz clic en un diente para actualizarlo
            </div>
          )}
        </div>
      </div>

      {/* Leyenda mejorada */}
      {showLegend && (
        <div className="mb-6 p-5 bg-white border-2 border-gray-200 rounded-xl shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-bold text-gray-800">Guía de Estados del Odontograma</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {statusOptions.map(opt => (
              <div 
                key={opt.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className={`w-6 h-6 rounded-md ${opt.color} border-2 ${opt.id === 'sano' ? 'border-gray-400' : 'border-transparent'} shadow-sm flex-shrink-0`}></div>
                <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles de Edición mejorados */}
      {!isViewingHistory && (
        <div className="mb-6 space-y-5 p-5 bg-white border-2 border-gray-200 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h4 className="text-lg font-bold text-gray-800">Panel de Edición</h4>
          </div>

          {/* Fecha del registro */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="changeDate" className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Fecha del Registro:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="changeDate"
                  value={changeDate}
                  onChange={(e) => setChangeDate(e.target.value)}
                  disabled={!isChangeDateEnabled}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                />
                <button
                  onClick={handleToggleChangeDate}
                  title={isChangeDateEnabled ? "Usar fecha actual" : "Permitir cambiar fecha"}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isChangeDateEnabled 
                      ? 'bg-primary text-white shadow-md hover:bg-primary-dark' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
              </div>
              {!isChangeDateEnabled && (
                <span className="text-xs text-gray-500 italic">(Usando fecha actual por defecto)</span>
              )}
            </div>
          </div>

          {/* Estados disponibles */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Estado a Aplicar:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {statusOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedStatus(opt.id)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 transform ${
                    selectedStatus === opt.id
                      ? `${opt.color} shadow-lg scale-105 ring-2 ring-offset-2 ring-current`
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-102 border border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {selectedStatus && (
              <p className="mt-2 text-xs text-gray-600 italic">
                Estado seleccionado: <span className="font-semibold">{statusOptions.find(s => s.id === selectedStatus)?.label}</span>
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows="3"
              maxLength={1000}
              placeholder="Agregar observaciones sobre el cambio de estado del diente..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm shadow-sm transition-all"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">{observaciones.length}/1000 caracteres</p>
              {observaciones.length > 0 && (
                <button
                  onClick={() => setObservaciones('')}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Instrucciones mejoradas */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Instrucciones de uso:</p>
                <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Selecciona un estado de la lista superior</li>
                  <li>Opcionalmente, configura una fecha diferente (por defecto usa la fecha actual)</li>
                  <li>Agrega observaciones si es necesario</li>
                  <li>Haz clic en el diente que deseas actualizar en el odontograma</li>
                  <li>Haz doble clic en un diente para ver su historial completo</li>
                </ol>
              </div>
            </div>
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
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="text-sm font-bold text-blue-800 flex items-center justify-center gap-2">
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
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="text-sm font-bold text-blue-800 flex items-center justify-center gap-2">
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
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <div className="text-sm font-bold text-green-800 flex items-center justify-center gap-2">
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
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <div className="text-sm font-bold text-green-800 flex items-center justify-center gap-2">
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
    </div>
  );
};

export default Odontogram;
