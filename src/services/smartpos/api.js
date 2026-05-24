import axios from 'axios';

const BASE_URL = import.meta.env.VITE_SMARTPOS_API || 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export function setupInterceptors(logoutFn) {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5;
        console.warn(`Rate limited. Retry after ${retryAfter}s`);
        return Promise.reject(new Error(`Too many requests. Please wait ${retryAfter} seconds.`));
      }
      if (error.response?.status === 401) {
        logoutFn();
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      return Promise.reject(error);
    }
  );
}

export default api;