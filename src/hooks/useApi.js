import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (method, url, data = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance[method](url, data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const get = useCallback((url) => apiCall('get', url), [apiCall]);
  const post = useCallback((url, data) => apiCall('post', url, data), [apiCall]);
  const put = useCallback((url, data) => apiCall('put', url, data), [apiCall]);
  const del = useCallback((url) => apiCall('delete', url), [apiCall]);

  return { isLoading, error, get, post, put, del };
};