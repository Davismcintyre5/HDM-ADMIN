import api, { setAuthToken } from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const d = res.data.data || res.data;
  localStorage.setItem('farmvexa_token', d.token);
  localStorage.setItem('farmvexa_refresh_token', d.refreshToken);
  localStorage.setItem('farmvexa_admin', JSON.stringify(d.admin || d));
  setAuthToken(d.token);
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

export async function getAdmins() {
  const res = await api.get('/auth');
  return res.data;
}

export async function createAdmin(data) {
  const res = await api.post('/auth', data);
  return res.data;
}

export async function toggleAdminStatus(id) {
  const res = await api.put(`/auth/${id}/toggle-status`);
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/auth/${id}`);
  return res.data;
}

export async function logout() {
  localStorage.removeItem('farmvexa_token');
  localStorage.removeItem('farmvexa_refresh_token');
  localStorage.removeItem('farmvexa_admin');
  setAuthToken(null);
}