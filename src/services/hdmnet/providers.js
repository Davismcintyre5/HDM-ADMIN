import api from './api';

export async function getProviders(params) {
  const res = await api.get('/providers', { params });
  return res.data;
}

export async function getProvider(id) {
  const res = await api.get(`/providers/${id}`);
  return res.data;
}

export async function suspendProvider(id, data) {
  const res = await api.put(`/providers/${id}/suspend`, data);
  return res.data;
}

export async function activateProvider(id) {
  const res = await api.put(`/providers/${id}/activate`);
  return res.data;
}

export async function deleteProvider(id, data) {
  const res = await api.delete(`/providers/${id}`, { data });
  return res.data;
}

export async function updateProviderCommission(id, data) {
  const res = await api.put(`/providers/${id}/commission`, data);
  return res.data;
}

export async function adjustProviderWallet(id, data) {
  const res = await api.put(`/providers/${id}/wallet`, data);
  return res.data;
}