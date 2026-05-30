import axios from 'axios';

const BASE_URL = import.meta.env.VITE_PORTFOLIO_API || 'http://localhost:5000/hdm/api/admin';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export function setupInterceptors(logoutFn) {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        logoutFn();
        return Promise.reject(new Error('Session expired'));
      }
      return Promise.reject(error);
    }
  );
}

export default api;