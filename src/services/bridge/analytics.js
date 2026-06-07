import api from './api';

export async function getDashboardStats() {
  const res = await api.get('/analytics/dashboard');
  return res.data;
}

export async function getUserGrowth(months = 12) {
  const res = await api.get('/analytics/user-growth', { params: { months } });
  return res.data;
}

export async function getEmailVolume(days = 30) {
  const res = await api.get('/analytics/email-volume', { params: { days } });
  return res.data;
}

export async function getRevenue(months = 12) {
  const res = await api.get('/analytics/revenue', { params: { months } });
  return res.data;
}

export async function getPlanDistribution() {
  const res = await api.get('/analytics/plan-distribution');
  return res.data;
}