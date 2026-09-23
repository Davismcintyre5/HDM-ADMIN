import api from './api';

export async function getAiUsage(params) {
  const res = await api.get('/ai-usage', { params });
  return res.data;
}

export async function getAiUsageSummary() {
  const res = await api.get('/ai-usage/summary');
  return res.data;
}