import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function getSettingsCategory(category) {
  const res = await api.get(`/settings/category/${category}`);
  return res.data;
}

export async function updateSetting(key, data) {
  const res = await api.put(`/settings/${key}`, data);
  return res.data;
}

export async function updateSettingsBulk(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function deleteSetting(key) {
  const res = await api.delete(`/settings/${key}`);
  return res.data;
}