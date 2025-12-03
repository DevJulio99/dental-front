import React, { useState, useEffect } from 'react';
import { ReactComponent as EditIcon } from '../../assets/icons/ic-edit.svg';
import { ReactComponent as TrashIcon } from '../../assets/icons/ic-delete.svg';
import UserModal from '../../components/admin/UserModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const roleClasses = {
  'Odontologo': 'bg-primary-100 text-primary-700',
  'Asistente': 'bg-success-100 text-success-700',
  'Admin': 'bg-primary-200 text-primary-800',
  'SuperAdmin': 'bg-error-100 text-error-700',
  'string': 'bg-gray-100 text-gray-700', // Fallback
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const { isLoading, error, get, post, put, del } = useApi();
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsListLoading(true);
        setListError(null);
        const data = await get('/Usuarios');
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (err) {
        setListError(err.message || 'No se pudo cargar la lista de usuarios.');
      } finally {
        setIsListLoading(false);
      }
    };
    fetchUsers();
  }, [get]);

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

  const handleSaveUser = async (id, payload) => {
    try {
      if (id) {
        const updatedUser = await put(`/Usuarios/${id}`, payload);
        setUsers(users.map(u => (u.id === id ? { ...u, ...payload } : u)));
        toast.success('Usuario actualizado con éxito.');
      } else {
        const newUser = await post('/Usuarios', payload);
        setUsers([...users, newUser]);
        toast.success('Usuario creado con éxito.');
      }
      handleCloseUserModal();
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar el usuario.');
    }
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      const deleteUser = async () => {
        try {
          await del(`/Usuarios/${userToDelete.id}`);
          setUsers(users.filter(u => u.id !== userToDelete.id));
          toast.success('Usuario eliminado con éxito.');
          setUserToDelete(null);
        } catch (err) {
          toast.error(err.message || 'No se pudo eliminar el usuario.');
        }
      };
      deleteUser();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button 
          onClick={handleOpenCreateModal} 
          className="flex items-center px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Usuario
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-soft">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4">Nombre Completo</th>
              <th scope="col" className="px-6 py-4">Email</th>
              <th scope="col" className="px-6 py-4">Rol</th>
              <th scope="col" className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isListLoading && <tr><td colSpan="4" className="text-center p-8"><LoadingSpinner /></td></tr>}
            {listError && !isListLoading && <tr><td colSpan="4" className="text-center p-8 text-error-600 font-medium">{listError}</td></tr>}
            {!isListLoading && !listError && users.map((user) => (
              <tr key={user.id} className="bg-white border-b border-gray-100 hover:bg-primary-50 transition-colors duration-150">
                <th scope="row" className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{`${user.nombre} ${user.apellido}`}</th>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleClasses[user.rol] || 'bg-gray-100 text-gray-700'}`}>{user.rol}</span></td>
                <td className="px-6 py-4 space-x-2 text-right">
                  <button 
                    onClick={() => handleOpenEditModal(user)} 
                    className="inline-flex items-center justify-center p-2.5 text-sm font-medium text-primary-600 bg-white border border-primary-300 rounded-lg hover:bg-primary-50 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 active:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
                    title="Editar"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setUserToDelete(user)} 
                    className="inline-flex items-center justify-center p-2.5 text-sm font-medium text-primary-600 bg-white border border-primary-300 rounded-lg hover:bg-primary-50 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 active:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
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
        isSaving={isLoading}
      />

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        isConfirming={isLoading}
        title="Confirmar Eliminación de Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nombre} ${userToDelete?.apellido}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Users;