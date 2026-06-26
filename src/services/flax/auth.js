import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/auth/profile');
  return res.data;
}

export async function getAdmins() {
  const res = await api.get('/auth/admins');
  return res.data;
}

export async function createAdmin(data) {
  const res = await api.post('/auth/admins', data);
  return res.data;
}

export async function updateAdmin(id, data) {
  const res = await api.put(`/auth/admins/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/auth/admins/${id}`);
  return res.data;
}

export async function getActivityLog(params = {}) {
  const res = await api.get('/auth/activity-log', { params });
  return res.data;
}