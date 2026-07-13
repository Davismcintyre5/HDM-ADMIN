import api from './api';

export async function getTenants(params) {
  const res = await api.get('/tenants', { params });
  return res.data;
}

export async function getTenantStats() {
  const res = await api.get('/tenants/stats');
  return res.data;
}

export async function getTenant(id) {
  const res = await api.get(`/tenants/${id}`);
  return res.data;
}

export async function updateTenant(id, data) {
  const res = await api.put(`/tenants/${id}`, data);
  return res.data;
}

export async function suspendTenant(id, reason) {
  const res = await api.put(`/tenants/${id}/suspend`, { reason });
  return res.data;
}

export async function activateTenant(id) {
  const res = await api.put(`/tenants/${id}/activate`);
  return res.data;
}

export async function deleteTenant(id) {
  const res = await api.delete(`/tenants/${id}`);
  return res.data;
}