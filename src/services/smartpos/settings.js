import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function getPublicSettings() {
  const res = await api.get('/settings/public');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

export async function invalidateCache() {
  const res = await api.post('/settings/cache/invalidate');
  return res.data;
}

export async function getCurrencies() {
  const res = await api.get('/settings/currencies');
  return res.data;
}

export async function updateCurrencies(data) {
  const res = await api.put('/settings/currencies', data);
  return res.data;
}

export async function getFeatureFlags() {
  const res = await api.get('/settings/feature-flags');
  return res.data;
}

export async function updateFeatureFlags(data) {
  const res = await api.put('/settings/feature-flags', data);
  return res.data;
}

export async function getSecurity() {
  const res = await api.get('/settings/security');
  return res.data;
}

export async function updateSecurity(data) {
  const res = await api.put('/settings/security', data);
  return res.data;
}

export async function getSync() {
  const res = await api.get('/settings/sync');
  return res.data;
}

export async function updateSync(data) {
  const res = await api.put('/settings/sync', data);
  return res.data;
}

export async function getOnboarding() {
  const res = await api.get('/settings/onboarding');
  return res.data;
}

export async function updateOnboarding(data) {
  const res = await api.put('/settings/onboarding', data);
  return res.data;
}

export async function getBranding() {
  const res = await api.get('/settings/branding');
  return res.data;
}

export async function updateBranding(data) {
  const res = await api.put('/settings/branding', data);
  return res.data;
}

export async function getTax() {
  const res = await api.get('/settings/tax');
  return res.data;
}

export async function updateTax(data) {
  const res = await api.put('/settings/tax', data);
  return res.data;
}

export async function getEmailSettings() {
  const res = await api.get('/settings/email');
  return res.data;
}

export async function updateEmailSettings(data) {
  const res = await api.put('/settings/email', data);
  return res.data;
}

export async function getSmsSettings() {
  const res = await api.get('/settings/sms');
  return res.data;
}

export async function updateSmsSettings(data) {
  const res = await api.put('/settings/sms', data);
  return res.data;
}

export async function getDownloads() {
  const res = await api.get('/settings/downloads');
  return res.data;
}

export async function addDownload(data) {
  const res = await api.post('/settings/downloads', data);
  return res.data;
}

export async function updateDownload(id, data) {
  const res = await api.put(`/settings/downloads/${id}`, data);
  return res.data;
}

export async function toggleDownload(id) {
  const res = await api.post(`/settings/downloads/${id}/toggle`);
  return res.data;
}

export async function reorderDownloads(ids) {
  const res = await api.post('/settings/downloads/reorder', { ids });
  return res.data;
}

export async function deleteDownload(id) {
  const res = await api.delete(`/settings/downloads/${id}`);
  return res.data;
}