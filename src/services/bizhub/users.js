import api from './api';

export async function getUsers(params) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUser(id, tenantId) {
  const res = await api.get(`/users/${id}`, { params: { tenantId } });
  return res.data;
}

export async function disableUser(id, tenantId) {
  const res = await api.put(`/users/${id}/disable`, { tenantId });
  return res.data;
}

export async function enableUser(id, tenantId) {
  const res = await api.put(`/users/${id}/enable`, { tenantId });
  return res.data;
}

export async function resetUserPassword(id, tenantId, newPassword) {
  const res = await api.put(`/users/${id}/reset-password`, { tenantId, newPassword });
  return res.data;
}