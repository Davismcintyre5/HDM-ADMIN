import api from './api';

export async function getDashboardStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
}

export async function getUsersByCampus() {
  const res = await api.get('/dashboard/users-by-campus');
  return res.data;
}

export async function getPostsByCampus() {
  const res = await api.get('/dashboard/posts-by-campus');
  return res.data;
}