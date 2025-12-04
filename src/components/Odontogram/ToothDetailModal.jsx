import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

const getToothName = (number) => {
  if (!number) return 'Diente';
  const quadrant = Math.floor(number / 10);
  const position = number % 10;

  let type = '';
  switch (position) {
    case 1: type = 'Incisivo Central'; break;
    case 2: type = 'Incisivo Lateral'; break;
    case 3: type = 'Canino'; break;
    case 4: type = 'Primer Premolar'; break;
    case 5: type = 'Segundo Premolar'; break;
    case 6: type = 'Primer Molar'; break;
    case 7: type = 'Segundo Molar'; break;
    case 8: type = 'Tercer Molar'; break;
    default: type = 'Diente';
  }

  let location = '';
  switch (quadrant) {
    case 1: location = 'Superior Derecho'; break;
    case 2: location = 'Superior Izquierdo'; break;
    case 3: location = 'Inferior Izquierdo'; break;
    case 4: location = 'Inferior Derecho'; break;
    default: location = '';
  }

  return `${type} ${location}`;
};

const ToothDetailModal = ({ isOpen, onClose, patientId, toothNumber, onUpdate }) => {
  const { get, post, isLoading } = useApi();
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const toothName = getToothName(toothNumber);

  const statusOptions = [
    { id: 'sano', label: 'Sano', color: 'bg-white border-gray-400' },
    { id: 'curado', label: 'Curado', color: 'bg-blue-500' },
    { id: 'pendiente', label: 'Pendiente', color: 'bg-yellow-400' },
    { id: 'caries', label: 'Caries', color: 'bg-purple-500' },
    { id: 'extraido', label: 'Extraído', color: 'bg-red-500' },
    { id: 'endodoncia', label: 'Endodoncia', color: 'bg-cyan-500' },
    { id: 'corona', label: 'Corona', color: 'bg-amber-500' },
    { id: 'implante', label: 'Implante', color: 'bg-emerald-500' },
    { id: 'fracturado', label: 'Fracturado', color: 'bg-orange-500' },
    { id: 'a_extraer', label: 'A Extraer', color: 'bg-red-600' },
    { id: 'puente', label: 'Puente', color: 'bg-violet-500' },
  ];

  const statusIds = statusOptions.map(opt => opt.id);

  const detailSchema = z.object({
    selectedStatus: z.enum(statusIds, { errorMap: () => ({ message: "Debes seleccionar un estado." }) }),
    observaciones: z.string().max(1000, "Máximo 1000 caracteres.").optional(),
    fechaRegistro: z.string().min(1, 'La fecha es requerida.')
      .refine(val => new Date(val) < new Date(new Date().setHours(23, 59, 59, 999)), {
        message: 'La fecha no puede ser futura.',
      }).refine(val => new Date(val).getFullYear() >= 1900, {
        message: 'El año no es válido.',
      }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      selectedStatus: 'sano',
      observaciones: '',
      fechaRegistro: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    if (isOpen && patientId && toothNumber) {
      loadHistorial();
      reset();
    }
  }, [isOpen, patientId, toothNumber]);

  const loadHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const data = await get(`/Odontogramas/paciente/${patientId}/diente/${toothNumber}/historial`);
      setHistorial(data || []);
    } catch (error) {
      toast.error('Error al cargar el historial del diente');
      console.error(error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const onFormSubmit = async (data) => {
    try {
      await post('/Odontogramas', {
        pacienteId: patientId,
        numeroDiente: toothNumber,
        estado: data.selectedStatus,
        observaciones: data.observaciones.trim() || null,
        fechaRegistroDateTime: data.fechaRegistro,
      });

      toast.success(`Estado del diente ${toothNumber} actualizado correctamente`);
      
      reset();

      await loadHistorial();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Error al guardar el estado del diente');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-4xl w-full flex flex-col max-h-[90vh]">
          <div className="bg-gradient-to-r from-primary-400 to-primary-600 px-6 pt-6 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {toothName} ({toothNumber})
                  </h3>
                  <p className="text-sm text-primary-100">Historial y Detalles</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-white focus:outline-none p-2 hover:bg-white/30 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-white/70 active:bg-white/40"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white px-6 pt-6 pb-4 overflow-y-auto">

            {/* Formulario para agregar nuevo registro mejorado */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl border-2 border-primary-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <h4 className="text-base font-bold text-gray-900">Agregar Nuevo Registro</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Estado
                  </label>
                  <select
                    {...register('selectedStatus')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Fecha de Registro
                  </label>
                  <input
                    type="date"
                    {...register('fechaRegistro')}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.fechaRegistro && <p className="mt-1 text-sm text-red-600">{errors.fechaRegistro.message}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  {...register('observaciones')}
                  rows="3"
                  maxLength={1000}
                  placeholder="Agregar observaciones sobre el estado del diente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.observaciones && <p className="mt-1 text-sm text-red-600">{errors.observaciones.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Registro
                  </>
                )}
              </button>
            </form>

            {/* Historial mejorado */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-base font-bold text-gray-900">Historial de Cambios</h4>
              </div>
              {loadingHistorial ? (
                <LoadingSpinner />
              ) : historial.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay registros históricos para este diente</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {historial.map((registro, index) => (
                    <div
                      key={registro.id || index}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                                statusOptions.find(s => s.id === registro.estado)?.color || 'bg-gray-200'
                              } ${statusOptions.find(s => s.id === registro.estado)?.id === 'sano' ? 'text-gray-700 border-2 border-gray-400' : 'text-white'}`}
                            >
                              {statusOptions.find(s => s.id === registro.estado)?.label || registro.estado}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {format(new Date(registro.fechaRegistroDateTime || registro.fechaRegistro), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          </div>
                          {registro.observaciones && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg border-l-4 border-primary">
                              <p className="text-sm text-gray-700">{registro.observaciones}</p>
                            </div>
                          )}
                          {registro.usuarioNombre && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Registrado por: <span className="font-semibold">{registro.usuarioNombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md sm:ml-3 sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>
    </div>
  );
};

export default ToothDetailModal;
