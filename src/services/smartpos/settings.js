import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.patch('/settings', data);
  return res.data;
}

export async function getPublicSettings() {
  const res = await api.get('/settings/public');
  return res.data;
}

export async function getFeatures() {
  const res = await api.get('/settings/features');
  return res.data;
}

export async function updateFeatures(data) {
  const res = await api.patch('/settings/features', data);
  return res.data;
}