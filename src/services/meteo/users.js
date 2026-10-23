import api from './api';

export async function getUsers(params) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
}

export async function resetUserPassword(id, data) {
  const res = await api.post(`/users/${id}/reset-password`, data);
  return res.data;
}

export async function updateUserApiKeyLimit(id, data) {
  const res = await api.patch(`/users/${id}/api-key-limit`, data);
  return res.data;
}