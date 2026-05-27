import api from './api';

export async function getDeepLinks(params = {}) {
  const res = await api.get('/deeplinks', { params });
  return res.data.data;
}

export async function createDeepLink(data) {
  const res = await api.post('/deeplinks', data);
  return res.data;
}

export async function updateDeepLink(linkId, data) {
  const res = await api.patch(`/deeplinks/${linkId}`, data);
  return res.data;
}

export async function deleteDeepLink(linkId) {
  const res = await api.delete(`/deeplinks/${linkId}`);
  return res.data;
}

export async function toggleDeepLink(linkId, isActive) {
  const res = await api.patch(`/deeplinks/${linkId}/toggle`, { isActive });
  return res.data;
}