import { useState } from 'react';
import toast from 'react-hot-toast';
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
  const [selectedStatus, setSelectedStatus] = useState('sano');
  const [observaciones, setObservaciones] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
  const [isDateChangeEnabled, setIsDateChangeEnabled] = useState(false);
  const toothName = getToothName(toothNumber);

  const handleSave = () => {
    const fechaObj = new Date(fechaRegistro + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaObj > hoy) {
      toast.error('No se pueden registrar fechas futuras');
      return;
    }

    onUpdate(toothNumber, selectedStatus, observaciones, fechaRegistro);
  };

  const handleToggleDateChange = () => {
    const newEnabledState = !isDateChangeEnabled;
    setIsDateChangeEnabled(newEnabledState);
    // Si se deshabilita, volver a la fecha de hoy
    if (!newEnabledState) {
      setFechaRegistro(new Date().toISOString().split('T')[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-lg w-full flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-check to-primary px-6 pt-6 pb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-blue-50">Actualizar: {toothName} ({toothNumber})</h3>
          <p className="text-sm text-blue-50">Selecciona el nuevo estado y añade observaciones si es necesario.</p>
        </div>

        <div className="bg-white px-6 pt-6 pb-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Estado a Aplicar</label>
            <div className="flex flex-wrap gap-2 pr-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedStatus(opt.id)}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 transform ${
                    selectedStatus === opt.id
                      ? `${opt.color} shadow-lg scale-105 ring-2 ring-offset-2 ring-current`
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-102 border border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fecha-registro-modal" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                id="fecha-registro-modal"
                value={fechaRegistro}
                onChange={(e) => setFechaRegistro(e.target.value)}
                disabled={!isDateChangeEnabled}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleToggleDateChange}
                title={isDateChangeEnabled ? "Usar fecha actual" : "Habilitar cambio de fecha"}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDateChangeEnabled
                    ? 'bg-primary text-white shadow-md hover:bg-primary-dark'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
            {!isDateChangeEnabled && (
              <p className="text-xs text-gray-500 mt-1 italic">(Usando fecha actual. Haz clic en el calendario para cambiarla).</p>
            )}
          </div>

          <div>
            <label htmlFor="observaciones-modal" className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea
              id="observaciones-modal"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows="3"
              maxLength={1000}
              placeholder="Añadir detalles sobre el estado..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-md px-6 py-3 bg-primary text-blue-50 font-semibold hover:bg-hover-btn-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Estado'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="items-center mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToothUpdateModal;