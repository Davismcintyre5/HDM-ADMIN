import api from './api';

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function suspendUser(id, data) {
  const res = await api.put(`/users/${id}/suspend`, data);
  return res.data;
}

export async function banUser(id, data) {
  const res = await api.put(`/users/${id}/ban`, data);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function restoreUser(id) {
  const res = await api.put(`/users/${id}/restore`);
  return res.data;
}