
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header/Header';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 text-gray-700 transition-all duration-200 ${
      isActive 
        ? 'border-l-4 border-primary-500 bg-primary-50 text-primary-700 font-semibold' 
        : 'hover:bg-gray-50 hover:text-primary-600'
    }`;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-2xl font-bold text-primary-600">DentalSys</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          <NavLink to="/" end className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/pacientes" className={navLinkClasses}>
            Pacientes
          </NavLink>
          <NavLink to="/agenda" className={navLinkClasses}>
            Agenda
          </NavLink>
          {user?.rol === 'Admin' && (
            <NavLink to="/usuarios" className={navLinkClasses}>
              Usuarios
            </NavLink>
          )}
          <NavLink to="/reportes" className={navLinkClasses}>
            Reportes
          </NavLink>
          <NavLink to="/configuracion" className={navLinkClasses}>
            Configuración
          </NavLink>
        </nav>
      </aside>
      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;