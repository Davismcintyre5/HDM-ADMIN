import { get, patch, post } from './api';

export async function getSettings() {
  const { data } = await get('/settings');
  return data || {}; // { 'branding.logoUrl': ..., 'support.email': ... }
}

export async function getSetting(key) {
  const { data } = await get(`/settings/${encodeURIComponent(key)}`);
  return data; // { key, value }
}

export async function updateSetting(key, value) {
  const { data } = await patch(`/settings/${encodeURIComponent(key)}`, { value });
  return data;
}

export async function bulkUpdateSettings(settings) {
  const { data } = await post('/settings/bulk', { settings });
  return data;
}