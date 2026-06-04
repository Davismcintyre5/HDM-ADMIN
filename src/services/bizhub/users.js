import api from './api';

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function createUser(data) {
  const res = await api.post('/users', data);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function toggleUserStatus(id) {
  const res = await api.patch(`/users/${id}/toggle-status`);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function getUserSubscriptions(id) {
  const res = await api.get(`/users/${id}/subscriptions`);
  return res.data;
}