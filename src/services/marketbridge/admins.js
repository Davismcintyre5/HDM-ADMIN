import api from './api';

export async function getAdmins() {
  const res = await api.get('/users');
  return res.data;
}

export async function createAdmin(data) {
  const res = await api.post('/users', data);
  return res.data;
}

export async function updateAdmin(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}