import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('admin@dentalsanisidro.pe');
  const [password, setPassword] = useState('1234');
  const [subdomain, setSubdomain] = useState('');
  const { login, isAuthenticated, isSubmitting } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, ingresa tu email y contraseña.');
      return;
    }

    const result = await login({ email, password, subdomain });
    console.log('result:', result);
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success('¡Bienvenido!');
      navigate('/');
    }
  };

  // Si el usuario ya está autenticado, lo redirigimos al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold text-gray-600">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 font-bold text-white rounded-md bg-primary hover:bg-blue-600 disabled:bg-gray-400">
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;