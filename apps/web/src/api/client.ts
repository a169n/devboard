import axios from 'axios';
import { tokenStorage } from '../lib/storage';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('devboard:auth-expired'));
    }
    return Promise.reject(error);
  },
);
