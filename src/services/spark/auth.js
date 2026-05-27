import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}

export async function refreshToken(refreshToken) {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function logout() {
  const res = await api.post('/auth/logout');
  return res.data;
}