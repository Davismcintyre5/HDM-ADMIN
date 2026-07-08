import api from './api';

export async function getStores(params = {}) {
  const res = await api.get('/stores', { params });
  return res.data;
}

export async function getStore(id) {
  const res = await api.get(`/stores/${id}`);
  return res.data;
}

export async function getPendingStores() {
  const res = await api.get('/stores/pending');
  return res.data;
}

export async function approveStore(id) {
  const res = await api.put(`/stores/${id}/approve`);
  return res.data;
}

export async function rejectStore(id, reason) {
  const res = await api.put(`/stores/${id}/reject`, { reason });
  return res.data;
}

export async function suspendStore(id, reason) {
  const res = await api.put(`/stores/${id}/suspend`, { reason });
  return res.data;
}

export async function activateStore(id) {
  const res = await api.put(`/stores/${id}/activate`);
  return res.data;
}

export async function changeStoreTier(id, tier) {
  const res = await api.put(`/stores/${id}/tier`, { tier });
  return res.data;
}

export async function permanentDeleteStore(id) {
  const res = await api.delete(`/stores/${id}/permanent`);
  return res.data;
}