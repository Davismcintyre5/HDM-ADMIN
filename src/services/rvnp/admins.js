import api from './api';

export async function getAdmins() {
  const res = await api.get('/admins');
  return res.data;
}

export async function createAdmin(data) {
  const res = await api.post('/admins', data);
  return res.data;
}

export async function updateAdmin(id, data) {
  const res = await api.patch(`/admins/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/admins/${id}`);
  return res.data;
}