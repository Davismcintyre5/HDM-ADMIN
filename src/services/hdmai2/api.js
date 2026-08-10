import axios from 'axios';

const BASE_URL = import.meta.env.VITE_HDMAI2_API || 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status >= 500 || !status) {
      console.error(`[ERROR] ${status || 'NETWORK'} — ${error.config?.url}`, error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export default api;