import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const profileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido.').regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, 'El nombre solo puede contener letras, acentos y espacios.'),
  apellido: z.string().min(1, 'El apellido es requerido.').regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, 'El apellido solo puede contener letras, acentos y espacios.'),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida.'),
  newPassword: z.string().min(3, 'La nueva contraseña debe tener al menos 3 caracteres.'),
  confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña.'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const { post, put } = useApi();
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, setValue, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { nombre: '', apellido: '' },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('nombre', user.nombre || '');
      setValue('apellido', user.apellido || '');
    }
  }, [user, setValue]);

  const onProfileSubmit = async (data) => {
    setIsProfileSaving(true);
    try {
      const updatedUser = await put(`/Usuarios/${user.id}`, {
        nombre: data.nombre,
        apellido: data.apellido,
      });
      updateUser(updatedUser);
      toast.success('¡Perfil actualizado con éxito!');
    } catch (error) {
        console.log('error:', error);
      toast.error(error.message || 'No se pudo actualizar el perfil.');
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  const onPasswordSubmit = async (data) => {
    setIsPasswordChanging(true);
    try {
      await post(`/Usuarios/change-password`, {
        userId: user.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('¡Contraseña cambiada con éxito!');
      resetPasswordForm();
    } catch (error) {
      toast.error(error.message || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Configuración de Usuario</h1>

      <div className="bg-white p-6 rounded-lg shadow-soft border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Información Personal</h2>
        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-600">Nombre</label>
              <input type="text" id="nombre" {...registerProfile('nombre')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              {profileErrors.nombre && <p className="mt-1 text-sm text-red-600">{profileErrors.nombre.message}</p>}
            </div>
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-600">Apellido</label>
              <input type="text" id="apellido" {...registerProfile('apellido')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              {profileErrors.apellido && <p className="mt-1 text-sm text-red-600">{profileErrors.apellido.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
            <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm cursor-not-allowed" />
          </div>
          <div className="text-right">
            <button type="submit" disabled={isProfileSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              {isProfileSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-soft border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Cambiar Contraseña</h2>
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-600">Contraseña Actual</label>
            <input type="password" id="currentPassword" {...registerPassword('currentPassword')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            {passwordErrors.currentPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600">Nueva Contraseña</label>
            <input type="password" id="newPassword" {...registerPassword('newPassword')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Confirmar Nueva Contraseña</label>
            <input type="password" id="confirmPassword" {...registerPassword('confirmPassword')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>}
          </div>
          <div className="text-right">
            <button type="submit" disabled={isPasswordChanging} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              {isPasswordChanging ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;