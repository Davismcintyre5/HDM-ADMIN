import api from './api';

export async function getAiSettings() {
  const res = await api.get('/ai');
  return res.data;
}

export async function updateAiSettings(data) {
  const res = await api.put('/ai', data);
  return res.data;
}

export async function testAiProvider(key) {
  const res = await api.post(`/ai/providers/${key}/test`);
  return res.data;
}