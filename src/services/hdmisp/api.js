import axios from 'axios';

const API_BASE = import.meta.env.VITE_HDMISP_API || 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;
let refreshHandler = null;
let unauthorizedHandler = null;
let refreshing = null;

export function setAuthToken(token) {
  authToken = token || null;
  if (authToken) {
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function setupInterceptors({ getRefreshToken, onTokenRefreshed, onUnauthorized } = {}) {
  refreshHandler = async () => {
    const rt = getRefreshToken?.();
    if (!rt) throw new Error('No refresh token');

    if (refreshing) return refreshing;

    refreshing = (async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/auth/refresh`,
          { refreshToken: rt },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );
        const payload = res?.data?.data || res?.data;
        if (!payload?.accessToken) throw new Error('Refresh response missing accessToken');

        setAuthToken(payload.accessToken);
        onTokenRefreshed?.(payload);
        return payload.accessToken;
      } finally {
        refreshing = null;
      }
    })();

    return refreshing;
  };

  unauthorizedHandler = onUnauthorized || null;

  api.interceptors.request.use(
    (config) => {
      if (authToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (err) => Promise.reject(normalizeError(err))
  );

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      const status = error.response?.status;
      const isRefreshCall = original?.url?.includes('/auth/refresh');
      const isLoginCall = original?.url?.includes('/auth/login');

      if (status === 401 && !original?._retry && !isRefreshCall && !isLoginCall && refreshHandler) {
        original._retry = true;
        try {
          await refreshHandler();
          return api(original);
        } catch {
          unauthorizedHandler?.();
          return Promise.reject(normalizeError(error));
        }
      }

      if (status === 401 && !isLoginCall && !isRefreshCall) {
        unauthorizedHandler?.();
      }

      return Promise.reject(normalizeError(error));
    }
  );
}

export function normalizeError(err) {
  if (!err) return { message: 'Unknown error', status: 0, payload: null };

  const res = err.response;
  const body = res?.data || {};
  const status = res?.status ?? 0;

  let message =
    body.message ||
    body.error?.message ||
    (typeof body === 'string' ? body : null) ||
    err.message ||
    'Request failed';

  if (status === 401) message = body.message || 'Session expired. Please sign in again.';
  if (status === 403) message = body.message || 'You do not have permission to do that.';
  if (status === 429) message = body.message || 'Too many requests. Please try again shortly.';
  if (status === 502) message = body.message || 'Upstream service failed. Try again.';
  if (status === 503) message = body.message || 'Service temporarily unavailable.';
  if (status >= 500 && !body.message) message = 'Server error. Please try again.';

  return {
    message,
    status,
    code: body.code || null,
    requestId: body.requestId || null,
    details: body.details || null,
    payload: body && typeof body === 'object' ? body : null,
  };
}

export function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === 'object' && 'success' in body) {
    return { data: body.data, meta: body.meta || null, message: body.message };
  }
  return { data: body, meta: null, message: null };
}

export async function get(url, config) {
  const res = await api.get(url, config);
  return unwrap(res);
}

export async function post(url, body, config) {
  const res = await api.post(url, body, config);
  return unwrap(res);
}

export async function patch(url, body, config) {
  const res = await api.patch(url, body, config);
  return unwrap(res);
}

export async function del(url, config) {
  const res = await api.delete(url, config);
  return unwrap(res);
}

export default api;