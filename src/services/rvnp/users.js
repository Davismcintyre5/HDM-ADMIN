import api from './api';

export async function getUsers(params) {
  const res = await api.get('/users', { params });
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

export async function reactivateUser(id) {
  const res = await api.put(`/users/${id}/reactivate`);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function changeUserRole(id, data) {
  const res = await api.put(`/users/${id}/role`, data);
  return res.data;
}

export async function verifyUser(id) {
  const res = await api.put(`/users/${id}/verify`);
  return res.data;
}

export async function toggleHdmVerified(id) {
  const res = await api.put(`/users/${id}/hdm-verified`);
  return res.data;
}