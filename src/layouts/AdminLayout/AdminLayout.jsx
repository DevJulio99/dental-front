
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import './AdminLayout.scss'; // Ya no es necesario

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 text-blue-50 transition-colors duration-200 transform hover:bg-white hover:text-blue-100 ${
      isActive ? 'border-l-[7px] border-[#82C9FE] bg-white font-bold' : ''
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-primary text-blue-50">
        <div className="flex items-center justify-center h-16">
          <span className="text-2xl font-bold">DentalSys</span>
        </div>
        <nav className="flex-1 py-4 space-y-2">
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
        <div className="p-4">
          <p className="font-semibold text-center truncate">
            {user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Usuario'}
          </p>
          <button onClick={logout} className="w-full px-4 py-2 mt-2 text-sm font-medium text-blue-50 transition-colors duration-200 transform bg-white/10 border border-white/20 rounded-md hover:bg-white/20 hover:border-white/30 focus:outline-none focus:bg-white/20">
            Cerrar Sesión
          </button>
        </div>
      </aside>
      {/* Contenido Principal */}
      <main className="flex-1 p-6 overflow-y-auto bg-light-blue">
        <Outlet /> {/* Aquí se renderizan las páginas (Dashboard, Pacientes, etc.) */}
      </main>
    </div>
  );
};

export default AdminLayout;