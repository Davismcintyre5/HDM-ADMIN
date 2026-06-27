import api from './api';

export async function getStats() {
  const res = await api.get('/stats');
  return res.data;
}

export async function getUsage(params = {}) {
  const res = await api.get('/stats/usage', { params });
  return res.data;
}