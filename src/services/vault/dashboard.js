import api from './api';

export async function getDashboard() {
  const res = await api.get('/dashboard');
  return res.data.data;
}

export async function getRevenue() {
  const res = await api.get('/dashboard/revenue');
  return res.data.data;
}

export async function getRecentUsers(limit = 10) {
  const res = await api.get('/dashboard/recent-users', { params: { limit } });
  return res.data.data;
}