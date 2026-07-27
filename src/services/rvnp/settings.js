import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(section, data) {
  const res = await api.patch(`/settings/${section}`, data);
  return res.data;
}