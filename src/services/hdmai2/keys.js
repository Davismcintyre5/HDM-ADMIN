import api from './api';

export async function getKeys(params) {
  const res = await api.get('/keys', { params });
  return res.data;
}

export async function getKeyStats() {
  const res = await api.get('/keys/stats');
  return res.data;
}

export async function generateKey(data) {
  const res = await api.post('/keys/generate', data);
  return res.data;
}

export async function revokeKey(id, data) {
  const res = await api.put(`/keys/${id}/revoke`, data);
  return res.data;
}

export async function restoreKey(id) {
  const res = await api.put(`/keys/${id}/restore`);
  return res.data;
}

export async function changeKeyPlan(id, data) {
  const res = await api.put(`/keys/${id}/change-plan`, data);
  return res.data;
}