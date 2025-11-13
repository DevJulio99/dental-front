import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const emptyForm = {
  title: '',
  patient: '',
  treatments: [],
  observations: '',
};

// En una aplicación real, esto vendría de la configuración del consultorio.
const availableTreatments = ['Limpieza Dental', 'Blanqueamiento', 'Extracción', 'Empaste', 'Endodoncia', 'Ortodoncia'];

const AppointmentModal = ({ isOpen, onClose, onSave, slotInfo, eventToEdit }) => {
  const [formData, setFormData] = useState(emptyForm);
  const modalRef = useModalInteraction(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        // Modo Editar: Parseamos el título para separar tratamiento y paciente
        const [title, patient] = eventToEdit.title.split(' - ');
        setFormData({
          id: eventToEdit.id,
          title: title || '',
          patient: patient || '',
          treatments: eventToEdit.treatments || [],
          observations: eventToEdit.observations || '',
        });
      } else {
        // Modo Crear: Reseteamos el formulario
        setFormData(emptyForm);
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.patient) {
      toast.error('Por favor, complete todos los campos.');
      return;
    }
    onSave({
      ...formData, // Incluye el ID si estamos editando
      title: `${formData.title} - ${formData.patient}`,
      start: eventToEdit?.start || slotInfo.start, // Usa la fecha existente o la del nuevo slot
      end: eventToEdit?.end || slotInfo.end,
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleTreatmentsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, treatments: selectedOptions }));
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{eventToEdit ? 'Editar Cita' : 'Crear Nueva Cita'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tratamiento / Motivo</label>
              <input type="text" id="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700">Paciente</label>
              <input type="text" id="patient" value={formData.patient} onChange={handleInputChange} placeholder="Buscar o escribir nombre del paciente..." className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="treatments" className="block text-sm font-medium text-gray-700">Tratamientos Realizados</label>
              <select id="treatments" multiple value={formData.treatments} onChange={handleTreatmentsChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24">
                {availableTreatments.map(treatment => <option key={treatment} value={treatment}>{treatment}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea id="observations" value={formData.observations} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600">Agendar Cita</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;