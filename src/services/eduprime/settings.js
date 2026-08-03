import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function getLandingSettings() {
  const res = await api.get('/settings/landing');
  return res.data;
}

export async function getChatSettings() {
  const res = await api.get('/settings/chat');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function updateSettingsSection(section, data) {
  const res = await api.put(`/settings/${section}`, data);
  return res.data;
}