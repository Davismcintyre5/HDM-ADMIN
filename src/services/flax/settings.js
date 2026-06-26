import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateBranding(data) {
  const res = await api.put('/settings/branding', data);
  return res.data;
}

export async function updateContact(data) {
  const res = await api.put('/settings/contact', data);
  return res.data;
}

export async function updateSecurity(data) {
  const res = await api.put('/settings/security', data);
  return res.data;
}

export async function updateUssd(data) {
  const res = await api.put('/settings/ussd', data);
  return res.data;
}

export async function updateNotifications(data) {
  const res = await api.put('/settings/notifications', data);
  return res.data;
}