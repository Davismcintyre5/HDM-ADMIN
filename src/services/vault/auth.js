import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}

export async function refreshAccessToken(token) {
  const res = await api.post('/auth/refresh', { refreshToken: token });
  return res.data.data;
}

export async function logout(token) {
  const res = await api.post('/auth/logout', { refreshToken: token });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data;
}

export async function changePassword(data) {
  const res = await api.put('/auth/change-password', data);
  return res.data;
}