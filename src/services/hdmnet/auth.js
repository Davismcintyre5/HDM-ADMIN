import api from './api';

export async function login(email, password) {
  const res = await api.post('/admin/auth/login', { email, password });
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/admin/auth/profile');
  return res.data;
}