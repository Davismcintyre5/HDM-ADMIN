import api from './api';

export async function getAIConfig() {
  const res = await api.get('/admin/ai-config');
  return res.data.data;
}

export async function updateAIConfig(data) {
  const res = await api.put('/admin/ai-config', data);
  return res.data;
}