import axios from 'axios';

const BASE_URL = import.meta.env.VITE_EDUPRIME_API || 'http://localhost:5000/api/admin';

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

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) { refreshSubscribers.forEach(cb => cb(token)); refreshSubscribers = []; }
function addRefreshSubscriber(cb) { refreshSubscribers.push(cb); }

export function setupInterceptors(logoutFn) {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status !== 401 || originalRequest._retry) return Promise.reject(error);
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (!token) return reject(new Error('Session expired'));
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('eduprime_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { token: accessToken, refreshToken: newRefresh } = res.data.data || res.data;
        localStorage.setItem('eduprime_token', accessToken);
        localStorage.setItem('eduprime_refresh_token', newRefresh);
        setAuthToken(accessToken);
        onRefreshed(accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        onRefreshed(null);
        logoutFn();
        return Promise.reject(new Error('Session expired'));
      } finally { isRefreshing = false; }
    }
  );
}

export default api;