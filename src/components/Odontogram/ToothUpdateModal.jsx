import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';

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

const statusIds = statusOptions.map(opt => opt.id);

const toothUpdateSchema = z.object({
  selectedStatus: z.enum(statusIds, { errorMap: () => ({ message: "Debes seleccionar un estado." }) }),
  observaciones: z.string().max(1000, "Máximo 1000 caracteres.").optional(),
  fechaRegistro: z.string().min(1, 'La fecha es requerida.')
    .refine(val => new Date(val) < new Date(new Date().setHours(23, 59, 59, 999)), {
      message: 'La fecha no puede ser futura.',
    }).refine(val => new Date(val).getFullYear() >= 1900, {
      message: 'El año no es válido.',
    }),
});

const getToothName = (number) => {
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

const ToothUpdateModal = ({ isOpen, onClose, toothNumber, onUpdate, isSaving }) => {
  const [isDateChangeEnabled, setIsDateChangeEnabled] = useState(false);
  const toothName = getToothName(toothNumber);

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(toothUpdateSchema),
    defaultValues: {
      selectedStatus: 'sano',
      observaciones: '',
      fechaRegistro: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        selectedStatus: 'sano',
        observaciones: '',
        fechaRegistro: new Date().toISOString().split('T')[0],
      });
      setIsDateChangeEnabled(false);
    }
  }, [isOpen, reset]);

  const handleToggleDateChange = () => {
    const newEnabledState = !isDateChangeEnabled;
    setIsDateChangeEnabled(newEnabledState);
    // Si se deshabilita, volver a la fecha de hoy
    if (!newEnabledState) {
      setValue('fechaRegistro', new Date().toISOString().split('T')[0], { shouldValidate: true });
    }
  };

  const onFormSubmit = (data) => {
    onUpdate(toothNumber, data.selectedStatus, data.observaciones, data.fechaRegistro);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-lg w-full flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-primary-400 to-primary-600 px-6 pt-6 pb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">Actualizar: {toothName} ({toothNumber})</h3>
          <p className="text-sm text-primary-100">Selecciona el nuevo estado y añade observaciones si es necesario.</p>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-grow overflow-hidden">
          <div className="bg-white px-6 pt-6 pb-4 space-y-4 overflow-y-auto">
            <Controller
              name="selectedStatus"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Estado a Aplicar</label>
                  <div className="flex flex-wrap gap-2 pr-2">
                    {statusOptions.map(opt => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => field.onChange(opt.id)}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 transform ${
                          field.value === opt.id
                            ? `${opt.color} shadow-lg scale-105 ring-2 ring-offset-2 ring-current`
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-102 border border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.selectedStatus && <p className="mt-1 text-sm text-red-600">{errors.selectedStatus.message}</p>}
                </div>
              )}
            />

            <div>
              <label htmlFor="fecha-registro-modal" className="block text-sm font-medium text-gray-800 mb-2">Fecha de Registro</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="fecha-registro-modal"
                  {...register('fechaRegistro')}
                  disabled={!isDateChangeEnabled}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleToggleDateChange}
                  title={isDateChangeEnabled ? "Usar fecha actual" : "Habilitar cambio de fecha"}
                  className={`p-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isDateChangeEnabled
                      ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
              </div>
              {errors.fechaRegistro && <p className="mt-1 text-sm text-red-600">{errors.fechaRegistro.message}</p>}
              {!isDateChangeEnabled && (
                <p className="text-xs text-gray-500 mt-1 italic">(Usando fecha actual. Haz clic en el calendario para cambiarla).</p>
              )}
            </div>

            <div>
              <label htmlFor="observaciones-modal" className="block text-sm font-medium text-gray-800 mb-1">Observaciones (opcional)</label>
              <textarea
                id="observaciones-modal"
                {...register('observaciones')}
                rows="3"
                maxLength={1000}
                placeholder="Añadir detalles sobre el estado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.observaciones && <p className="mt-1 text-sm text-red-600">{errors.observaciones.message}</p>}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200 flex-shrink-0">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md sm:ml-3 sm:w-auto"
            >
              {isSaving ? 'Guardando...' : 'Guardar Estado'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center items-center px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 transition-all duration-200 sm:mt-0 sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToothUpdateModal;