import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

export const AuthContext = createContext(null);

const AuthLogic = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tenant, setTenant] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true); // Para la carga inicial
  const [isSubmitting, setIsSubmitting] = useState(false); // Para envíos de formulario
  const navigate = useNavigate(); // Ahora esto es seguro porque AuthLogic estará dentro del Router

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedTenant) {
        setTenant(JSON.parse(storedTenant));
      }
    }
    setIsSessionLoading(false);
  }, [token]);

  const login = async (credentials) => {
    setIsSubmitting(true);
    try {
      const { data: { token, user, tenant } } = await axiosInstance.post('/Auth/login', credentials);
      
      // Guardamos los datos en localStorage para persistir la sesión
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tenant', JSON.stringify(tenant));

      setToken(token); // Actualiza el estado del token
      setUser(user);
      setTenant(tenant);

      // No necesitas configurar axios.defaults.headers.common aquí.
      // El interceptor de request en axiosInstance.js ya se encarga de añadir el token.

      navigate('/'); // Redirigimos al dashboard
      return { success: true };
    } catch (error) {
      console.error('Error de inicio de sesión:', error.response?.data || error.message);
      // Aseguramos que siempre haya un mensaje de error para mostrar en el toast.
      const message = error.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales o intente más tarde.';
      return { success: false, message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    // Limpiamos el estado y el localStorage
    setUser(null);
    setTenant(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    
    // No necesitas eliminar el header de autorización de axios.defaults.
    // El interceptor de request en axiosInstance.js leerá un token nulo
    // o inexistente del localStorage y no lo añadirá.

    navigate('/login'); // Redirigimos a la página de login
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    token,
    tenant,
    isAuthenticated: !!token,
    isSessionLoading, // Renombrado para claridad
    isSubmitting, // Nuevo estado para el botón
    login,
    logout,
    updateUser,
  };

  // No renderizamos los hijos hasta que sepamos si hay una sesión activa o no
  if (isSessionLoading) {
    return <LoadingSpinner />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }) => {
  // AuthProvider ahora solo provee el contexto, pero la lógica que usa
  // hooks de react-router-dom está en AuthLogic.
  // Esto nos permite envolver AuthLogic con el Router.
  return (
    <BrowserRouter>
      <AuthLogic>{children}</AuthLogic>
    </BrowserRouter>
  );
};