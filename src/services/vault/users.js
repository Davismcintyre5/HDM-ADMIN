import api from './api';

export async function getUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data.data;
}

export async function suspendUser(id) {
  const res = await api.put(`/users/${id}/suspend`);
  return res.data;
}

export async function reactivateUser(id) {
  const res = await api.put(`/users/${id}/reactivate`);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}