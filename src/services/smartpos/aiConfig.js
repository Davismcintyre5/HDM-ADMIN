import api from './api';

export async function getAIConfig() {
  const res = await api.get('/ai-config');
  return res.data.data; // { config }
}

export async function updateAIConfig(data) {
  const res = await api.put('/ai-config', data);
  return res.data.data;
}