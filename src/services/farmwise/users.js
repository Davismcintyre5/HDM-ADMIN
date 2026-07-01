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

export async function resetPassword(id) {
  const res = await api.post(`/users/${id}/reset-password`);
  return res.data;
}

export async function suspendUser(id) {
  const res = await api.post(`/users/${id}/suspend`);
  return res.data;
}

export async function activateUser(id) {
  const res = await api.post(`/users/${id}/activate`);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}