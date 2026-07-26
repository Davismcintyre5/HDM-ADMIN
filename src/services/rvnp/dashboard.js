import api from './api';

export async function getStats() {
  const res = await api.get('/stats');
  return res.data;
}

export async function getQuickStats() {
  const res = await api.get('/stats/quick');
  return res.data;
}

export async function getUserGrowth(days = 30) {
  const res = await api.get('/stats/user-growth', { params: { days } });
  return res.data;
}

export async function getContentActivity(days = 7) {
  const res = await api.get('/stats/content-activity', { params: { days } });
  return res.data;
}