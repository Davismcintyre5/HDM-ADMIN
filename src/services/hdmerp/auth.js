import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}

export async function refreshAccessToken(refreshToken) {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data.data;
}