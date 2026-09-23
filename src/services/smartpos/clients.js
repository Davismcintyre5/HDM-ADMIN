import api from './api';

export async function getClients(params) {
  const res = await api.get('/tenants', { params });
  return res.data;
}

export async function getClient(id) {
  const res = await api.get(`/tenants/${id}`);
  return res.data;
}

export async function updateClient(id, patch) {
  const res = await api.patch(`/tenants/${id}`, patch);
  return res.data;
}

export async function suspendClient(id, data) {
  const res = await api.post(`/tenants/${id}/suspend`, data);
  return res.data;
}

export async function reactivateClient(id) {
  const res = await api.post(`/tenants/${id}/reactivate`);
  return res.data;
}

export async function deleteClient(id) {
  const res = await api.delete(`/tenants/${id}`);
  return res.data;
}

export async function impersonateClient(id) {
  const res = await api.post(`/tenants/${id}/impersonate`);
  return res.data;
}