import api from './api';

export async function getUserGrowth(params) {
  const res = await api.get('/analytics/user-growth', { params });
  return res.data;
}

export async function getPostGrowth(params) {
  const res = await api.get('/analytics/post-growth', { params });
  return res.data;
}

export async function getEngagement() {
  const res = await api.get('/analytics/engagement');
  return res.data;
}

export async function getActiveUsers(params) {
  const res = await api.get('/analytics/active-users', { params });
  return res.data;
}

export async function getPopularPosts(params) {
  const res = await api.get('/analytics/popular-posts', { params });
  return res.data;
}

export async function getFullAnalytics() {
  const res = await api.get('/analytics/full');
  return res.data;
}