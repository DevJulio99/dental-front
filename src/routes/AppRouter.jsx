import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import NotFound from '../pages/NotFound';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import PrivateRoute from './PrivateRoute';

// --- Lazy Loading de las páginas ---
// En lugar de importar directamente, usamos React.lazy con import() dinámico.
const Login = lazy(() => import('../pages/auth/Login')); // Ya estaba bien, pero lo confirmo
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Patients = lazy(() => import('../pages/admin/Patients'));
const Agenda = lazy(() => import('../pages/admin/Agenda'));
const PatientDetail = lazy(() => import('../pages/admin/PatientDetail'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const UserSettings = lazy(() => import('../pages/admin/UserSettings'));
const Users = lazy(() => import('../pages/admin/Users'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const PublicBooking = lazy(() => import('../pages/public/PublicBooking'));

const AppRouter = () => {
  return (
    <>
      {/* Colocamos el Toaster aquí para que siempre esté disponible junto a las rutas */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #22c55e',
              padding: '16px',
              fontSize: '1.1rem',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #ef4444',
              padding: '16px',
              fontSize: '1.1rem',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Ruta pública para el login */}
          <Route path="/login" element={<Login />} />
          <Route path="/reservar" element={<PublicBooking />} />

          {/* Rutas privadas que usan el layout de administración */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pacientes" element={<Patients />} />
            <Route path="pacientes/:patientId" element={<PatientDetail />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="user-settings" element={<UserSettings />} />
            <Route path="configuracion" element={<Settings />} />
            <Route 
              path="usuarios" 
              element={<PrivateRoute allowedRoles={['Admin']}><Users /></PrivateRoute>} 
            />
            <Route path="reportes" element={<Reports />} />
          </Route>

          {/* Ruta para páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRouter;