import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance[method](url, data);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      setIsLoading(false);
      throw err; // Lanza el error para que el componente que llama pueda manejarlo si es necesario
    }
  }, []);

  const get = useCallback((url) => request('get', url), [request]);
  const post = useCallback((url, data) => request('post', url, data), [request]);
  const put = useCallback((url, data) => request('put', url, data), [request]);
  const del = useCallback((url) => request('delete', url), [request]); // 'delete' es una palabra reservada

  return { isLoading, error, get, post, put, del };
};