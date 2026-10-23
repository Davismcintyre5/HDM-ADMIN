import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_METEO_API || 'http://localhost:5000/admin';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export function setupInterceptors({ onUnauthorized } = {}) {
  api.interceptors.request.use(
    (config) => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        config.headers['X-Request-Id'] = crypto.randomUUID();
      }
      return config;
    },
    (error) => Promise.reject(normalizeError(error))
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      if (status === 401) {
        onUnauthorized?.();
      }

      if (status === 403 && code === 'SUPER_ADMIN_REQUIRED') {
        // Surface as-is; pages can decide how to handle it
      }

      return Promise.reject(normalizeError(error));
    }
  );
}

export function normalizeError(error) {
  if (error && typeof error === 'object' && 'status' in error && 'code' in error) {
    return error;
  }

  const res = error?.response;
  const data = res?.data;

  const code =
    data?.code ||
    data?.error?.code ||
    (res?.status ? `HTTP_${res.status}` : 'NETWORK_ERROR');

  const message =
    data?.message ||
    data?.error?.message ||
    error?.message ||
    'Something went wrong';

  return {
    status: res?.status ?? 0,
    code,
    message,
    details: data?.details ?? null,
    requestId: data?.requestId ?? null,
    isNetwork: !res,
    isServer: (res?.status ?? 0) >= 500,
    isForbidden: res?.status === 403,
    isSuperAdminRequired: code === 'SUPER_ADMIN_REQUIRED',
    raw: error,
  };
}

export default api;