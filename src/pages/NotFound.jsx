
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">Página No Encontrada</h2>
      <p className="mt-2 text-gray-600">La página que buscas no existe o ha sido movida.</p>
      <Link to="/" className="px-4 py-2 mt-6 font-bold text-white transition-colors duration-200 transform rounded-md bg-primary hover:bg-blue-600">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;