import api from './api';

export async function getDashboardStats() {
  const res = await api.get('/health');
  return res.data?.data || res.data;
}