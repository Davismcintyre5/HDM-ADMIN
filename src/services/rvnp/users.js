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

export async function suspendUser(id, data) {
  const res = await api.post(`/users/${id}/suspend`, data);
  return res.data;
}

export async function unsuspendUser(id) {
  const res = await api.post(`/users/${id}/unsuspend`);
  return res.data;
}

export async function banUser(id, data) {
  const res = await api.post(`/users/${id}/ban`, data);
  return res.data;
}

export async function unbanUser(id) {
  const res = await api.post(`/users/${id}/unban`);
  return res.data;
}

export async function verifyUser(id) {
  const res = await api.post(`/users/${id}/verify`);
  return res.data;
}

export async function unverifyUser(id, data) {
  const res = await api.post(`/users/${id}/unverify`, data);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}