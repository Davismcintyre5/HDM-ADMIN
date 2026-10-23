import api from './api';

export async function getTenants(params) {
  const res = await api.get('/tenants', { params });
  return res.data;
}

export async function getTenant(id) {
  const res = await api.get(`/tenants/${id}`);
  return res.data;
}

export async function updateTenant(id, data) {
  const res = await api.patch(`/tenants/${id}`, data);
  return res.data;
}

export async function suspendTenant(id) {
  const res = await api.post(`/tenants/${id}/suspend`);
  return res.data;
}

export async function reactivateTenant(id) {
  const res = await api.post(`/tenants/${id}/reactivate`);
  return res.data;
}

export async function deleteTenant(id) {
  const res = await api.delete(`/tenants/${id}`);
  return res.data;
}