import api from './api';

export async function getAISettings() {
  const res = await api.get('/ai/settings');
  return res.data;
}

export async function updateAISettings(data) {
  const res = await api.patch('/ai/settings', data);
  return res.data;
}