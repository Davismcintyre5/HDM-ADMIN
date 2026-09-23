import api from './api';

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