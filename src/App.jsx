import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
// import { TenantProvider } from './contexts/TenantContext'; // Descomentar si se implementa
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    // <TenantProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    // </TenantProvider>
  );
}

export default App;