import api from './api';

export async function getApiKeys(params) {
  const res = await api.get('/api-keys', { params });
  return res.data;
}

export async function revokeApiKey(id) {
  const res = await api.post(`/api-keys/${id}/revoke`);
  return res.data;
}