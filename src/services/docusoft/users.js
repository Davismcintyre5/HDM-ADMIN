import api from './api';

export async function getUsers() {
  const res = await api.get('/admin/users');
  return res.data;
}

export async function updateUserRole(id, role) {
  const res = await api.put(`/admin/users/${id}/role`, { role });
  return res.data;
}

export async function updateUserStatus(id, isActive) {
  const res = await api.put(`/admin/users/${id}/status`, { isActive });
  return res.data;
}