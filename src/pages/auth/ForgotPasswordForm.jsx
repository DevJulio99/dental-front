import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El email es requerido.').email('El formato del correo no es válido.'),
});

const ForgotPasswordForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
  initialEmail,
}) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
    }
  }, [initialEmail, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
          placeholder="Ingresa el email de tu cuenta"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md">
        {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </button>
      <button type="button" onClick={onCancel} className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-800">
        Cancelar
      </button>
    </form>
  );
};

export default ForgotPasswordForm;