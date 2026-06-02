import api from './api';

export async function getDashboard() {
  const res = await api.get('/dashboard');
  return res.data;
}

export async function getUserGrowth(days = 30) {
  const res = await api.get('/dashboard/user-growth', { params: { days } });
  return res.data;
}

export async function getPostActivity(days = 30) {
  const res = await api.get('/dashboard/post-activity', { params: { days } });
  return res.data;
}

export async function getTopPosts(limit = 10) {
  const res = await api.get('/dashboard/top-posts', { params: { limit } });
  return res.data;
}

export async function getRevenue() {
  const res = await api.get('/dashboard/revenue');
  return res.data;
}

export async function getActiveUsers() {
  const res = await api.get('/dashboard/active-users');
  return res.data;
}