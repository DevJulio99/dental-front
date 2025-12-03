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
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
        </div>
        <form id="patient-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombres</label><input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
              <div><label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos</label><input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
            </div>
            <div><label htmlFor="dniPasaporte" className="block text-sm font-medium text-gray-700">DNI / Pasaporte</label><input type="text" id="dniPasaporte" value={formData.dniPasaporte} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label><input type="date" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
              <div><label htmlFor="genero" className="block text-sm font-medium text-gray-700">Género</label><select id="genero" value={formData.genero} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
            </div>
            <div><label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label><input type="tel" id="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required/></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-primary"/></div>
            <div><label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label><input type="text" id="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/></div>
            <div><label htmlFor="alergias" className="block text-sm font-medium text-gray-700">Alergias</label><textarea id="alergias" value={formData.alergias} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
            <div><label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label><textarea id="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
          </div>
        </form>
        <div className="flex justify-end p-6 space-x-2 border-t">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
            <button type="submit" form="patient-form" disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-blue-50 rounded-md bg-primary hover:bg-hover-btn-primary hover:text-white disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default PatientModal;
