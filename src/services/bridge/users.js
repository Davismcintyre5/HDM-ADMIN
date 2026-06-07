import api from './api';

export async function getUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
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

export async function getOrganizations(params = {}) {
  const res = await api.get('/organizations', { params });
  return res.data;
}

export async function getOrganization(id) {
  const res = await api.get(`/organizations/${id}`);
  return res.data;
}