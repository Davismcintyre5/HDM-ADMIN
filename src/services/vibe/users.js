import api from './api';

export async function getUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function banUser(id, reason) {
  const res = await api.put(`/users/${id}/ban`, { reason });
  return res.data;
}

export async function unbanUser(id) {
  const res = await api.put(`/users/${id}/unban`);
  return res.data;
}

export async function verifyUser(id) {
  const res = await api.put(`/users/${id}/verify`);
  return res.data;
}

export async function unverifyUser(id) {
  const res = await api.put(`/users/${id}/unverify`);
  return res.data;
}

export async function updateUserRole(id, role) {
  const res = await api.put(`/users/${id}/role`, { role });
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}