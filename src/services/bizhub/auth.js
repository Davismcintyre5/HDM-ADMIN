import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/auth/profile');
  return res.data;
}

export async function updateProfile(data) {
  const res = await api.put('/auth/profile', data);
  return res.data;
}

export async function changePassword(data) {
  const res = await api.put('/auth/change-password', data);
  return res.data;
}