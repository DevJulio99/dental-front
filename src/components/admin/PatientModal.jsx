import React, { useState, useEffect, useRef } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const emptyPatientForm = {
  fullName: '',
  dni: '',
  birthDate: '',
  phone: '',
  email: '',
};

const PatientModal = ({ isOpen, onClose, patientToEdit, onSave }) => {
  const [formData, setFormData] = useState(emptyPatientForm);
  const modalRef = useModalInteraction(isOpen, onClose);

  useEffect(() => {
    // Cuando el modal se abre, decidimos si es para editar o crear
    if (isOpen) {
      if (patientToEdit) {
        setFormData(patientToEdit); // Cargar datos para editar
      } else {
        setFormData(emptyPatientForm); // Limpiar para crear
      }
    }
  }, [isOpen, patientToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!patientToEdit;

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Los inputs del formulario no cambian, solo sus valores */}
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label><input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI / Pasaporte</label><input type="text" id="dni" value={formData.dni} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label><input type="date" id="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label><input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-primary" /></div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600">Guardar Paciente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
