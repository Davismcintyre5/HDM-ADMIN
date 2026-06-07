import api from './api';

export async function getAdmins() {
  const res = await api.get('/admins');
  return res.data;
}

export async function getAdmin(id) {
  const res = await api.get(`/admins/${id}`);
  return res.data;
}

export async function createAdmin(data) {
  const res = await api.post('/admins', data);
  return res.data;
}

export async function updateAdmin(id, data) {
  const res = await api.put(`/admins/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id) {
  const res = await api.delete(`/admins/${id}`);
  return res.data;
}

export async function getRoles() {
  const res = await api.get('/admins/roles/all');
  return res.data;
}

export async function createRole(data) {
  const res = await api.post('/admins/roles', data);
  return res.data;
}

export async function updateRole(id, data) {
  const res = await api.put(`/admins/roles/${id}`, data);
  return res.data;
}

export async function getAuditLogs(params = {}) {
  const res = await api.get('/admins/audit-logs', { params });
  return res.data;
}