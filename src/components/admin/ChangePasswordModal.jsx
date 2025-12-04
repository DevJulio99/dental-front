import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  newPassword: z.string().min(3, 'La contraseña debe tener al menos 3 caracteres.'),
  confirmPassword: z.string().min(3, 'La confirmación debe tener al menos 3 caracteres.'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

const ChangePasswordModal = ({ isOpen, onClose, user }) => {
  const { post } = useApi();
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data) => {
    setIsPasswordChanging(true);
    try {
      await post('/Usuarios/change-password', {
        userId: user.id,
        currentPassword: '',
        newPassword: data.newPassword,
      });
      toast.success('Contraseña actualizada con éxito.');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-large w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cambiar Contraseña</h3>
        <p className="text-sm text-gray-600 mb-4">
          Estás cambiando la contraseña para: <span className="font-semibold">{user.nombre} {user.apellido}</span>
        </p>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600">Nueva Contraseña</label>
            <input type="password" id="newPassword" {...register('newPassword')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" autoFocus />
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Confirmar Nueva Contraseña</label>
            <input type="password" id="confirmPassword" {...register('confirmPassword')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-100 transition-all duration-200">Cancelar</button>
            <button type="submit" disabled={isPasswordChanging} className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md">{isPasswordChanging ? 'Cambiando...' : 'Restablecer Contraseña'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;