import api from './api';

export async function getOverview() {
  const res = await api.get('/dashboard/overview');
  return res.data;
}

export async function getRecent() {
  const res = await api.get('/dashboard/recent');
  return res.data;
}

export async function getCharts(days = 30) {
  const res = await api.get('/dashboard/charts', { params: { days } });
  return res.data;
}