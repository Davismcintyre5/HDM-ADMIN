import api from './api';

export async function getTenants(params) {
  const res = await api.get('/tenants', { params });
  return res.data;
}

export async function getTenant(id) {
  const res = await api.get(`/tenants/${id}`);
  return res.data;
}

export async function updateTenant(id, patch) {
  const res = await api.patch(`/tenants/${id}`, patch);
  return res.data;
}

export async function suspendTenant(id, data) {
  const res = await api.post(`/tenants/${id}/suspend`, data);
  return res.data;
}

export async function reactivateTenant(id) {
  const res = await api.post(`/tenants/${id}/reactivate`);
  return res.data;
}

export async function impersonateTenant(id) {
  const res = await api.post(`/tenants/${id}/impersonate`);
  return res.data;
}