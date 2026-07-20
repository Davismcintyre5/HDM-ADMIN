import api from './api';

export async function getClients(params) {
  const res = await api.get('/clients', { params });
  return res.data;
}

export async function getClient(id) {
  const res = await api.get(`/clients/${id}`);
  return res.data;
}

export async function suspendClient(id, reason) {
  const res = await api.patch(`/clients/${id}/suspend`, { reason });
  return res.data;
}

export async function reactivateClient(id) {
  const res = await api.patch(`/clients/${id}/reactivate`);
  return res.data;
}

export async function deleteClient(id) {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
}