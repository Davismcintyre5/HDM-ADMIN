import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_SMARTPOS_API ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/admin';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let getRefreshToken = () => null;
let onTokenRefreshed = () => {};
let onUnauthorized = () => {};

export function setupInterceptors({
  getRefreshToken: getRT,
  onTokenRefreshed: onRefreshed,
  onUnauthorized: onUnauth,
} = {}) {
  if (getRT) getRefreshToken = getRT;
  if (onRefreshed) onTokenRefreshed = onRefreshed;
  if (onUnauth) onUnauthorized = onUnauth;
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
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

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await axios.post(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 15000 }
  );

  const payload = res.data?.data || res.data;
  const accessToken = payload?.accessToken || payload?.token;
  const newRefresh = payload?.refreshToken;

  if (!accessToken) throw new Error('Refresh did not return access token');

  onTokenRefreshed({ accessToken, refreshToken: newRefresh || refreshToken });
  setAuthToken(accessToken);

  return accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;

    if (!original) return Promise.reject(normalizeError(error));

    const url = original.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/refresh');

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
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
    data?.error?.code ||
    data?.code ||
    (res?.status ? `HTTP_${res.status}` : 'NETWORK_ERROR');

  const message =
    data?.error?.message ||
    data?.message ||
    error?.message ||
    'Something went wrong';

  return {
    status: res?.status ?? 0,
    code,
    message,
    details: data?.error?.details ?? data?.details ?? null,
    isNetwork: !res,
    isServer: (res?.status ?? 0) >= 500,
    raw: error,
  };
}

export default api;