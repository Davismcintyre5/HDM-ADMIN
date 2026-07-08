import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSetting(key, value) {
  const res = await api.put(`/settings/${key}`, { value });
  return res.data;
}

export async function updateEmailProvider(provider) {
  const res = await api.put('/settings/providers/email', { provider });
  return res.data;
}

export async function updateSmsProvider(provider) {
  const res = await api.put('/settings/providers/sms', { provider });
  return res.data;
}