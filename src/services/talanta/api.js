// src/services/talanta/api.js
import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_TALANTA_API || 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 20000,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
  if (authToken) {
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getAuthToken = () => authToken;

/**
 * Setup response interceptors.
 * @param {Function} onUnauthorized  called on 401
 */
export const setupInterceptors = (onUnauthorized) => {
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        onUnauthorized?.();
      }

      const data = error.response?.data;
      const message =
        data?.error?.message ||
        data?.message ||
        error.message ||
        'Request failed';

      error.message = message;
      return Promise.reject(error);
    }
  );
};

export default api;