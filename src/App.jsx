
import { AuthProvider } from './contexts/AuthContext';
// import { TenantProvider } from './contexts/TenantContext'; // Descomentar si se implementa
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
}

export default App;