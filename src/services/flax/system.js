import api from './api';

export async function getHealth() {
  const res = await api.get('/system/health');
  return res.data;
}

export async function getLogs(params = {}) {
  const res = await api.get('/system/logs', { params });
  return res.data;
}

export async function getStats() {
  const res = await api.get('/system/stats');
  return res.data;
}

export async function getOverview() {
  const res = await api.get('/system/overview');
  return res.data;
}