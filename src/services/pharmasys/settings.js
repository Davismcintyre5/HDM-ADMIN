import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.patch('/settings', data);
  return res.data;
}

export async function updateFeatures(data) {
  const res = await api.patch('/settings/features', data);
  return res.data;
}

export async function getAiConfig() {
  const res = await api.get('/settings/ai');
  return res.data;
}

export async function updateAiConfig(data) {
  const res = await api.patch('/settings/ai', data);
  return res.data;
}

export async function testAiProvider(key) {
  const res = await api.post(`/settings/ai/test/${key}`);
  return res.data;
}

export async function getMpesaConfig() {
  const res = await api.get('/settings/mpesa');
  return res.data;
}

export async function updateMpesaConfig(data) {
  const res = await api.patch('/settings/mpesa', data);
  return res.data;
}

export async function getPublicSettings() {
  const res = await api.get('/settings/public');
  return res.data;
}