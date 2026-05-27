import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data.data;
}

export async function updateSystem(data) {
  const res = await api.put('/settings/system', data);
  return res.data;
}

export async function updateSecurity(data) {
  const res = await api.put('/settings/security', data);
  return res.data;
}

export async function updateNotifications(data) {
  const res = await api.put('/settings/notifications', data);
  return res.data;
}

export async function updateThreatIntel(data) {
  const res = await api.put('/settings/threat-intel', data);
  return res.data;
}

export async function updateFeatures(data) {
  const res = await api.put('/settings/features', data);
  return res.data;
}

export async function updatePayments(data) {
  const res = await api.put('/settings/payments', data);
  return res.data;
}

export async function updateCurrency(data) {
  const res = await api.put('/settings/currency', data);
  return res.data;
}

export async function updateAI(data) {
  const res = await api.put('/settings/ai', data);
  return res.data;
}