import React, { useState, useEffect, useRef } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';
import { format } from 'date-fns';

const emptyPatientForm = {
  firstName: '',
  lastName: '',
  dniPasaporte: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  direccion: '',
  genero: 'Masculino', // Valor por defecto
  alergias: '',
  observaciones: '',
};

const PatientModal = ({ isOpen, onClose, patientToEdit, onSave, isSaving }) => {
  const [formData, setFormData] = useState(emptyPatientForm);
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);

  useEffect(() => {
    // Cuando el modal se abre, decidimos si es para editar o crear
    if (isOpen) {
      if (patientToEdit) {
        const formattedPatient = {
          ...patientToEdit,
          fechaNacimiento: patientToEdit.fechaNacimiento ? format(new Date(patientToEdit.fechaNacimiento), 'yyyy-MM-dd') : '',
          alergias: patientToEdit.alergias || '',
          observaciones: patientToEdit.observaciones || '',
        };
        setFormData(formattedPatient); // Cargar datos para editar
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
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      nombreCompleto: `${formData.firstName} ${formData.lastName}`.trim(),
      dniPasaporte: formData.dniPasaporte,
      fechaNacimiento: formData.fechaNacimiento 
        ? new Date(formData.fechaNacimiento).toISOString() 
        : null,
      telefono: formData.telefono,
      email: formData.email,
      direccion: formData.direccion,
      alergias: formData.alergias,
      genero: formData.genero,
      observaciones: formData.observaciones,
    };

    // Si estamos editando, pasamos el ID por separado para que la función onSave lo use en la URL.
    // El ID no se incluye en el cuerpo (payload) de la petición PUT.
    onSave(formData.id, payload);
  };

  const isEditing = !!patientToEdit;

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded">&times;</button>
        </div>
        <form id="patient-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label htmlFor="firstName" className="block text-sm font-medium text-gray-800">Nombres</label><input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
              <div><label htmlFor="lastName" className="block text-sm font-medium text-gray-800">Apellidos</label><input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
            </div>
            <div><label htmlFor="dniPasaporte" className="block text-sm font-medium text-gray-800">DNI / Pasaporte</label><input type="text" id="dniPasaporte" value={formData.dniPasaporte} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-800">Fecha de Nacimiento</label><input type="date" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
              <div><label htmlFor="genero" className="block text-sm font-medium text-gray-800">Género</label><select id="genero" value={formData.genero} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
            </div>
            <div><label htmlFor="telefono" className="block text-sm font-medium text-gray-800">Teléfono</label><input type="tel" id="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-primary"/></div>
            <div><label htmlFor="direccion" className="block text-sm font-medium text-gray-800">Dirección</label><input type="text" id="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/></div>
            <div><label htmlFor="alergias" className="block text-sm font-medium text-gray-800">Alergias</label><textarea id="alergias" value={formData.alergias} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
            <div><label htmlFor="observaciones" className="block text-sm font-medium text-gray-800">Observaciones</label><textarea id="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
          </div>
        </form>
        <div className="flex justify-end p-6 space-x-3 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 transition-all duration-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              form="patient-form" 
              disabled={isSaving} 
              className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSaving ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default PatientModal;
