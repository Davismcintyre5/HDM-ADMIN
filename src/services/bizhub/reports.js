import api from './api';

export async function getRevenueReport() {
  const res = await api.get('/reports/revenue');
  return res.data;
}

export async function getUserGrowthReport() {
  const res = await api.get('/reports/user-growth');
  return res.data;
}

export async function getSystemUsageReport() {
  const res = await api.get('/reports/system-usage');
  return res.data;
}

export async function exportReport(type) {
  const res = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
  return res.data;
}