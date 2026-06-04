import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function changePassword(data) {
  const res = await api.post('/auth/change-password', data);
  return res.data;
}

export async function logout() {
  const res = await api.post('/auth/logout');
  return res.data;
}