
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const location = useLocation();

  if (isSessionLoading) return <div>Verificando sesión...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    toast.error('No tienes permiso para acceder a esta página.');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;