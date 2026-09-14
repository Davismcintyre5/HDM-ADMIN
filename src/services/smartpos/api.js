import axios from 'axios';

const BASE_URL = import.meta.env.VITE_SMARTPOS_API || 'http://localhost:5000/api/v1/admin';

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

export function setupInterceptors(logoutFn) {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status !== 401 || originalRequest._retry) return Promise.reject(error);

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('smartpos_refresh_token');
        if (!refreshToken) {
          logoutFn();
          return Promise.reject(new Error('No refresh token'));
        }

        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const d = res.data.data || res.data;
        const accessToken = d.accessToken;
        const newRefresh = d.refreshToken;

        localStorage.setItem('smartpos_token', accessToken);
        localStorage.setItem('smartpos_refresh_token', newRefresh);
        setAuthToken(accessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };

        return api(originalRequest);
      } catch (refreshErr) {
        logoutFn();
        return Promise.reject(new Error('Session expired'));
      }
    }
  );
}

export default api;