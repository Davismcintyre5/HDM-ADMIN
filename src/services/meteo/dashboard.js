import api from './api';

export async function getStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
}

export async function getRecentActivity() {
  const res = await api.get('/dashboard/recent-activity');
  return res.data;
}