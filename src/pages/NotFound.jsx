
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-primary-50">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">Página No Encontrada</h2>
      <p className="mt-2 text-gray-600">La página que buscas no existe o ha sido movida.</p>
      <Link 
        to="/" 
        className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;