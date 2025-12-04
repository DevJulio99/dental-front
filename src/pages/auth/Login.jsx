import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';

import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

const Login = () => {
  const [email, setEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null); // null, 'enterEmail', 'resetPassword'
  const [resetToken, setResetToken] = useState('');

  const { login, isAuthenticated, isSubmitting } = useAuth();
  const { post, isLoading: isPasswordResetLoading } = useApi();
  const navigate = useNavigate();

  const handleLoginSubmit = async (data) => {
    const result = await login({ ...data, subdomain });
    console.log('result:', result);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success('¡Bienvenido!');
      navigate('/');
    }
  };

  const handleRequestResetToken = async (data) => {
    try {
      const response = await post('/Auth/forgot-password', { email: data.email, subdomain });
      setResetToken(response.token);
      setForgotPasswordStep('resetPassword');
      setEmail(data.email);
      toast.success('Token generado. Ahora puedes crear una nueva contraseña.');
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo iniciar el proceso de reseteo.';
      toast.error(message);
    }
  };

  const handleResetPassword = async (data) => {
    try {
      await post('/Auth/reset-password', {
        email,
        token: resetToken,
        newPassword: data.newPassword,
        subdomain
      });
      toast.success('¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
      setForgotPasswordStep(null);
      setResetToken('');
    } catch (error) {
      const message = error.response?.data?.message || 'El token es inválido, ha expirado o la contraseña es débil.';
      toast.error(message);
    }
  };

  // Si el usuario ya está autenticado, lo redirigimos al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-large">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DentalSys
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            {forgotPasswordStep === 'resetPassword' && 'Restablecer Contraseña'}
            {forgotPasswordStep === 'enterEmail' && 'Recuperar Contraseña'}
            {!forgotPasswordStep && 'Iniciar Sesión'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {forgotPasswordStep === 'enterEmail' ? 'Ingresa tu email para recibir instrucciones.' : 'Accede a tu sistema de gestión dental'}
          </p>
        </div>
        
        {!forgotPasswordStep && (
          <LoginForm
            onSubmit={handleLoginSubmit}
            isSubmitting={isSubmitting}
            onForgotPassword={() => setForgotPasswordStep('enterEmail')}
          />
        )}

        {forgotPasswordStep === 'enterEmail' && (
          <ForgotPasswordForm
            initialEmail={email}
            onSubmit={handleRequestResetToken}
            isSubmitting={isPasswordResetLoading}
            onCancel={() => setForgotPasswordStep(null)}
          />
        )}

        {forgotPasswordStep === 'resetPassword' && (
          <ResetPasswordForm
            email={email}
            onSubmit={handleResetPassword}
            isSubmitting={isPasswordResetLoading}
            onCancel={() => setForgotPasswordStep(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Login;