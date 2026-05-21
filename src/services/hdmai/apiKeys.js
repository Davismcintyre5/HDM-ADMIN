import api from './api';

export async function getApiKeys(params = {}) {
  const res = await api.get('/api-keys/admin/outbound', { params });
  return res.data.data;
}

export async function createApiKey(data) {
  const res = await api.post('/api-keys/admin/outbound', data);
  return res.data;
}

export async function updateApiKey(keyId, data) {
  const res = await api.put(`/api-keys/admin/outbound/${keyId}`, data);
  return res.data;
}

export async function deleteApiKey(keyId) {
  const res = await api.delete(`/api-keys/admin/outbound/${keyId}`);
  return res.data;
}

export async function rotateApiKey(keyId) {
  const res = await api.post(`/api-keys/admin/outbound/${keyId}/rotate`);
  return res.data;
}