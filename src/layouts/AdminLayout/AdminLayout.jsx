import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import './AdminLayout.scss'; // Ya no es necesario

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 text-gray-300 transition-colors duration-200 transform rounded-md hover:bg-gray-700 hover:text-white ${
      isActive ? 'bg-gray-700 text-white' : ''
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-secondary text-white">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-2xl font-bold text-primary">DentalSys</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <NavLink to="/" end className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/pacientes" className={navLinkClasses}>
            Pacientes
          </NavLink>
          <NavLink to="/agenda" className={navLinkClasses}>
            Agenda
          </NavLink>
          <NavLink to="/usuarios" className={navLinkClasses}>
            Usuarios
          </NavLink>
          <NavLink to="/reportes" className={navLinkClasses}>
            Reportes
          </NavLink>
          <NavLink to="/configuracion" className={navLinkClasses}>
            Configuración
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="font-semibold text-center truncate">
            {user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Usuario'}
          </p>
          <button onClick={logout} className="w-full px-4 py-2 mt-2 text-sm font-medium text-white transition-colors duration-200 transform bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-700">
            Cerrar Sesión
          </button>
        </div>
      </aside>
      {/* Contenido Principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet /> {/* Aquí se renderizan las páginas (Dashboard, Pacientes, etc.) */}
      </main>
    </div>
  );
};

export default AdminLayout;