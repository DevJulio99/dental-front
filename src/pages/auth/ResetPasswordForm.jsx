import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(3, 'La contraseña debe tener al menos 3 caracteres.'),
});

const ResetPasswordForm = ({
  email,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-gray-600">
        Estás cambiando la contraseña para: <span className="font-semibold text-gray-800">{email}</span>
      </p>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800 mb-1">
          Nueva Contraseña
        </label>
        <input
          type="password"
          id="newPassword"
          {...register('newPassword')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
          placeholder="Ingresa tu nueva contraseña"
          autoFocus
        />
        {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md">
        {isSubmitting ? 'Guardando...' : 'Restablecer Contraseña'}
      </button>
      <button type="button" onClick={onCancel} className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-800">
        Cancelar
      </button>
    </form>
  );
};

export default ResetPasswordForm;