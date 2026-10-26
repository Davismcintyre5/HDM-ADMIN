import axios from 'axios';

const ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = import.meta.env.VITE_TVETGRID_API || `${ROOT}/api/admin`;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

// ─── Silent refresh state ──────────────────────────────────
let getAccessToken = () => null;
let getRefreshToken = () => null;
let onRefresh = async () => null;
let onRefreshSuccess = () => {};
let onUnauthorized = () => {};
let refreshPromise = null;

export function setupInterceptors({
  getAccessToken: gAT,
  getRefreshToken: gRT,
  onRefresh: oR,
  onRefreshSuccess: oRS,
  onUnauthorized: oU,
} = {}) {
  if (gAT) getAccessToken = gAT;
  if (gRT) getRefreshToken = gRT;
  if (oR) onRefresh = oR;
  if (oRS) onRefreshSuccess = oRS;
  if (oU) onUnauthorized = oU;
}

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
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const original = error.config;

    if (!original) return Promise.reject(normalizeError(error));

    const url = original.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    // Silent refresh on TOKEN_EXPIRED (or 401 on protected routes)
    const shouldRefresh =
      status === 401 &&
      !original._retry &&
      !isAuthEndpoint &&
      (code === 'TOKEN_EXPIRED' || !code);

    if (shouldRefresh) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = onRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        original.headers = original.headers || {};
        original.headers['Authorization'] = `Bearer ${newToken}`;

        return api(original);
      } catch (refreshErr) {
        onUnauthorized();
        return Promise.reject(normalizeError(refreshErr));
      }
    }

    // Any other 401 → logout
    if (status === 401) {
      onUnauthorized();
    }

    return Promise.reject(normalizeError(error));
  }
);

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
    data?.error ||
    data?.message ||
    data?.error?.message ||
    error?.message ||
    'Something went wrong';

  return {
    status: res?.status ?? 0,
    code,
    message: typeof message === 'string' ? message : 'Request failed',
    details: data?.details ?? null,
    isNetwork: !res,
    isServer: (res?.status ?? 0) >= 500,
    isForbidden: res?.status === 403,
    isNotFound: res?.status === 404,
    isValidation: code === 'VALIDATION_001',
    raw: error,
  };
}

export default api;