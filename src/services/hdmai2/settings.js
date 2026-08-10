import api from './api';

export async function getSettings(params) {
  const res = await api.get('/settings', { params });
  return res.data;
}

export async function getSetting(key) {
  const res = await api.get(`/settings/${key}`);
  return res.data;
}

export async function createSetting(data) {
  const res = await api.post('/settings', data);
  return res.data;
}

export async function updateSetting(key, data) {
  const res = await api.put(`/settings/${key}`, data);
  return res.data;
}

export async function deleteSetting(key) {
  const res = await api.delete(`/settings/${key}`);
  return res.data;
}

export async function getCurrency() {
  const res = await api.get('/settings/currency');
  return res.data;
}

export async function updateCurrency(data) {
  const res = await api.put('/settings/currency', data);
  return res.data;
}