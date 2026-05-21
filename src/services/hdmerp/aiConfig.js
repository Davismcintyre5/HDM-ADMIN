import api from './api';

export async function getAIConfig() {
  const res = await api.get('/ai');
  return res.data.data;
}

export async function updateAIConfig(data) {
  const res = await api.put('/ai', data);
  return res.data.data;
}