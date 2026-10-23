import api, { setAuthToken, setupInterceptors } from './api';

export { setAuthToken, setupInterceptors };

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post('/auth/logout');
  return res.data;
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function updateMe(data) {
  const res = await api.patch('/auth/me', data);
  return res.data;
}

export async function changePassword(data) {
  const res = await api.post('/auth/change-password', data);
  return res.data;
}

export async function listAdmins() {
  const res = await api.get('/auth/admins');
  return res.data;
}

export async function createAdmin(data) {
  const res = await api.post('/auth/admins', data);
  return res.data;
}

export async function toggleAdmin(id) {
  const res = await api.patch(`/auth/admins/${id}/toggle`);
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/auth/admins/${id}`);
  return res.data;
}