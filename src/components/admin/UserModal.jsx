import React, { useState, useEffect } from 'react';
import { useModalInteraction } from '../../hooks/useModalInteraction';

const emptyUserForm = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'Asistente', // Rol por defecto
};

const roleOptions = ['Admin', 'Odontologo', 'Asistente', 'SuperAdmin'];

const UserModal = ({ isOpen, onClose, userToEdit, onSave, isSaving }) => {
  const [formData, setFormData] = useState(emptyUserForm);
  const modalRef = useModalInteraction(isOpen, onClose, isSaving);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData(userToEdit); // Cargar datos para editar
      } else {
        setFormData(emptyUserForm); // Limpiar para crear
      }
    }
  }, [isOpen, userToEdit]);

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
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      rol: formData.rol,
    };

    // La contraseña solo se envía si se está creando un usuario nuevo
    // o si se ha escrito algo en el campo de contraseña al editar.
    if (!isEditing || (isEditing && formData.password)) {
      if (!formData.password) {
        // Opcional: podrías mostrar un toast aquí si la contraseña es obligatoria al crear.
        return;
      }
      payload.password = formData.password;
    }
    onSave(formData.id, payload);
  };

  const isEditing = !!userToEdit;

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h2>
          <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombres</label><input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
              <div><label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellidos</label><input type="text" id="apellido" value={formData.apellido} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            </div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required /></div>
            <div><label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label><input type="password" id="password" value={formData.password} onChange={handleInputChange} placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required={!isEditing} /></div>
            <div><label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label><select id="rol" value={formData.rol} onChange={handleInputChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"><option disabled>Seleccione un rol</option>{roleOptions.map(role => (<option key={role} value={role}>{role}</option>))}</select></div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;