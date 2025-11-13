import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import './Login.scss'; // Ya no necesitamos este archivo

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirige al usuario a la página que intentaba visitar, o al dashboard si no había ninguna.
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // --- SIMULACIÓN DE LLAMADA A LA API ---
      // En un caso real, aquí llamarías a tu backend:
      // const response = await api.post('/auth/login', { email, password });
      // const { user, token } = response.data;
      // Para este ejemplo, usamos datos falsos si el email no está vacío.
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      const user = { name: 'Dr. House', email: email };
      const token = 'fake-jwt-token-for-demo';
      // --- FIN DE LA SIMULACIÓN ---

      login(user, token);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">DentalSys</h2>
          <p className="mt-2 text-gray-600">Acceso al Panel de Administración</p>
        </div>
        {error && <p className="p-3 text-sm text-center text-error bg-red-100 rounded-md">{error}</p>}
        <div className="space-y-4">
          <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full px-4 py-2 font-bold text-white transition-colors duration-200 rounded-md bg-primary hover:bg-blue-600">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;