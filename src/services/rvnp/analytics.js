import api from './api';

export async function getOverview() {
  const res = await api.get('/analytics/overview');
  return res.data;
}

export async function getContentAnalytics() {
  const res = await api.get('/analytics/content');
  return res.data;
}

export async function getCommunityAnalytics() {
  const res = await api.get('/analytics/community');
  return res.data;
}

export async function getDepartmentAnalytics() {
  const res = await api.get('/analytics/departments');
  return res.data;
}

export async function getRevenueAnalytics() {
  const res = await api.get('/analytics/revenue');
  return res.data;
}