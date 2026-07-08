import api from './api';

export async function getStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
}

export async function getRevenue(days = 30) {
  const res = await api.get('/dashboard/revenue', { params: { days } });
  return res.data;
}

export async function getTopStores() {
  const res = await api.get('/dashboard/top-stores');
  return res.data;
}

export async function getViews(days = 30) {
  const res = await api.get('/dashboard/views', { params: { days } });
  return res.data;
}