import axios from 'axios';

// Crea una instancia de Axios con una configuración base
const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_URL_BASE}/api` , // URL base de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor de Petición (Request Interceptor) ---
// Se ejecuta antes de que cada petición sea enviada.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtiene el token del localStorage
    if (token) {
      // Si el token existe, lo añade a la cabecera de autorización
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Maneja errores en la configuración de la petición
    return Promise.reject(error);
  }
);

// --- Interceptor de Respuesta (Response Interceptor) ---
// (Opcional pero recomendado) Se ejecuta cuando recibimos una respuesta.
axiosInstance.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, simplemente la devuelve
  (error) => {
    // Solo intervenimos si el error es 401 y NO estamos en la página de login.
    // Esto evita que una falla de login (que devuelve 401) cause una recarga innecesaria.
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login'); // Usamos replace para no añadir al historial
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;