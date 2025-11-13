import React, { useState } from 'react';
import { ReactComponent as EditIcon } from '../../assets/icons/ic-edit.svg';
import { ReactComponent as TrashIcon } from '../../assets/icons/ic-delete.svg';
import UserModal from '../../components/admin/UserModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// Datos de ejemplo. En una aplicación real, esto vendría de la API.
const sampleUsers = [
  {
    id: 1,
    fullName: 'Dr. Alan Grant',
    email: 'alan.grant@example.com',
    role: 'Odontólogo',
  },
  {
    id: 2,
    fullName: 'Ellie Sattler',
    email: 'ellie.sattler@example.com',
    role: 'Asistente',
  },
  {
    id: 3,
    fullName: 'Ian Malcolm',
    email: 'ian.malcolm@example.com',
    role: 'Odontólogo',
  },
  {
    id: 4,
    fullName: 'John Hammond',
    email: 'john.hammond@example.com',
    role: 'Administrador',
  },
];

const roleClasses = {
  'Odontólogo': 'bg-blue-100 text-blue-800',
  'Asistente': 'bg-green-100 text-green-800',
  'Administrador': 'bg-purple-100 text-purple-800',
};

const Users = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleOpenCreateModal = () => {
    setEditingUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (userData) => {
    if (userData.id) {
      console.log('Editando usuario:', userData);
      // TODO: API call to update user
    } else {
      console.log('Creando nuevo usuario:', userData);
      // TODO: API call to create user
    }
    handleCloseUserModal();
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      console.log('Eliminando usuario:', userToDelete);
      // TODO: API call to delete user
      setUserToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button onClick={handleOpenCreateModal} className="flex items-center px-4 py-2 font-bold text-white transition-colors duration-200 transform rounded-md bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Usuario
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre Completo</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Rol</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map((user) => (
              <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.fullName}</th>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleClasses[user.role] || 'bg-gray-100 text-gray-800'}`}>{user.role}</span></td>
                <td className="px-6 py-4 space-x-2 text-right">
                  <button onClick={() => handleOpenEditModal(user)} className="inline-flex items-center p-2 text-sm font-medium text-center text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300" title="Editar"><EditIcon className="w-4 h-4 text-white" /></button>
                  <button onClick={() => setUserToDelete(user)} className="inline-flex items-center p-2 text-sm font-medium text-center text-white rounded-lg bg-error hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300" title="Eliminar"><TrashIcon className="w-4 h-4 text-white" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userToEdit={editingUser}
        onSave={handleSaveUser}
      />

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Confirmar Eliminación de Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.fullName}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Users;