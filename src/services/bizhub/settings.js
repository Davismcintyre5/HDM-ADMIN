import api from './api';

export async function getSettings(category) {
  const res = await api.get('/settings', { params: { category } });
  return res.data;
}

export async function getFlags() {
  const res = await api.get('/settings/flags');
  return res.data;
}

export async function getSetting(key) {
  const res = await api.get(`/settings/${key}`);
  return res.data;
}

export async function updateSetting(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function bulkUpdateSettings(data) {
  const res = await api.post('/settings/bulk', data);
  return res.data;
}

export async function deleteSetting(key) {
  const res = await api.delete(`/settings/${key}`);
  return res.data;
}

export async function getFeatureFlags() {
  const res = await api.get('/settings', { params: { category: 'features' } });
  return res.data;
}