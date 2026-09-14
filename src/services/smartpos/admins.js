import api from './api';

export async function getAdmins(params) {
  const res = await api.get('/admins', { params });
  return res.data;
}

export async function inviteAdmin(data) {
  const res = await api.post('/admins/invite', data);
  return res.data;
}

export async function getAdmin(id) {
  const res = await api.get(`/admins/${id}`);
  return res.data;
}

export async function updateAdmin(id, data) {
  const res = await api.put(`/admins/${id}`, data);
  return res.data;
}

export async function changeAdminRole(id, data) {
  const res = await api.post(`/admins/${id}/role`, data);
  return res.data;
}

export async function deactivateAdmin(id) {
  const res = await api.post(`/admins/${id}/deactivate`);
  return res.data;
}

export async function activateAdmin(id) {
  const res = await api.post(`/admins/${id}/activate`);
  return res.data;
}

export async function resetAdminPassword(id) {
  const res = await api.post(`/admins/${id}/reset-password`);
  return res.data;
}