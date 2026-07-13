import api from './api';

export async function getDashboard() {
  const res = await api.get('/analytics/dashboard');
  return res.data;
}

export async function getRevenue(months = 12) {
  const res = await api.get('/analytics/revenue', { params: { months } });
  return res.data;
}

export async function getGrowth(months = 12) {
  const res = await api.get('/analytics/growth', { params: { months } });
  return res.data;
}