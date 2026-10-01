import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BIZHUB_API || 'http://localhost:5000/api/v1/admin';
const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

if (isDev) {
  api.interceptors.request.use((config) => {
    console.log(`[${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    return config;
  });
}

api.interceptors.response.use(
  (response) => {
    if (isDev) console.log(`[${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || 'unknown';
    if (status >= 500 || !status) {
      console.error(`[ERROR] ${status || 'NETWORK'} — ${url}`, error.response?.data?.message || error.message);
    } else if (isDev) {
      console.warn(`[${status}] ${url} — ${error.response?.data?.message || error.message}`);
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

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}
function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

export function setupInterceptors(logoutFn) {
  api.interceptors.response.use(
    (response) => {
      const body = response.data;

      if (body && typeof body === 'object' && 'success' in body) {
        return {
          ...response,
          data: body.data,
          pagination: body.pagination,
          message: body.message,
          success: body.success,
          error: body.error,
        };
      }

      return response;
    },
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
        const refreshToken = localStorage.getItem('bizhub_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const accessToken = res.data?.data?.accessToken || res.data?.accessToken;
        const newRefresh = res.data?.data?.refreshToken || res.data?.refreshToken;

        if (!accessToken) throw new Error('No access token in refresh response');

        localStorage.setItem('bizhub_token', accessToken);
        if (newRefresh) localStorage.setItem('bizhub_refresh_token', newRefresh);

        setAuthToken(accessToken);
        onRefreshed(accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        onRefreshed(null);
        localStorage.removeItem('bizhub_token');
        localStorage.removeItem('bizhub_refresh_token');
        localStorage.removeItem('bizhub_admin');
        if (typeof logoutFn === 'function') logoutFn();
        return Promise.reject(new Error('Session expired'));
      } finally {
        isRefreshing = false;
      }
    }
  );
}

export default api;