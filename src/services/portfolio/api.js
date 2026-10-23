import axios from 'axios';

const ADMIN_BASE =
  import.meta.env.VITE_PORTFOLIO_API || '/hdm/api/admin';

const ROOT = ADMIN_BASE.replace(/\/hdm\/api\/admin\/?$/, '');

export const api = axios.create({
  baseURL: ADMIN_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const publicApi = axios.create({
  baseURL: `${ROOT}/hdm/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export function setupInterceptors(logoutFn) {
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
      if (error.response?.status === 401) logoutFn?.();
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
    details: data?.details ?? data?.error?.details ?? null,
    isNetwork: !res,
    isServer: (res?.status ?? 0) >= 500,
    raw: error,
  };
}

export default api;