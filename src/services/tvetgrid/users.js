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

export async function changeUserRole(id, role) {
  const res = await api.patch(`/users/${id}/role`, { role });
  return res.data;
}

export async function disableUser(id, reason) {
  const res = await api.patch(`/users/${id}/disable`, { reason });
  return res.data;
}

export async function enableUser(id) {
  const res = await api.patch(`/users/${id}/enable`);
  return res.data;
}