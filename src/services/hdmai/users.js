import api from './api';

export async function getUsers(params = {}) {
  const res = await api.get('/admin/users', { params });
  return res.data.data;
}

export async function getUser(userId) {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data.data;
}

export async function updateUser(userId, data) {
  const res = await api.put(`/admin/users/${userId}`, data);
  return res.data;
}

export async function deleteUser(userId) {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
}