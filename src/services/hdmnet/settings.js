import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function updateBranding(data) {
  const res = await api.put('/settings/branding', data);
  return res.data;
}

export async function updateCommission(data) {
  const res = await api.put('/settings/commission', data);
  return res.data;
}

export async function updateEmailToggles(data) {
  const res = await api.put('/settings/email-toggles', data);
  return res.data;
}

export async function updateSmsToggles(data) {
  const res = await api.put('/settings/sms-toggles', data);
  return res.data;
}

export async function updateMaintenance(data) {
  const res = await api.put('/settings/maintenance', data);
  return res.data;
}