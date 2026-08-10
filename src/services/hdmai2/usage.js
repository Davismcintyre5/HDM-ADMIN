import api from './api';

export async function getUsageByPlan(days = 30) {
  const res = await api.get('/usage/by-plan', { params: { days } });
  return res.data;
}

export async function getTopUsers(days = 30, limit = 10) {
  const res = await api.get('/usage/top-users', { params: { days, limit } });
  return res.data;
}

export async function getDailyUsage(days = 30) {
  const res = await api.get('/usage/daily', { params: { days } });
  return res.data;
}