import api from './api';

export async function getUserGrowth(months = 12) {
  const res = await api.get('/reports/user-growth', { params: { months } });
  return res.data.data;
}

export async function getLicenses() {
  const res = await api.get('/reports/licenses');
  return res.data.data;
}

export async function getRevenueReport(months = 12) {
  const res = await api.get('/reports/revenue', { params: { months } });
  return res.data.data;
}

export async function getOrganizationsReport() {
  const res = await api.get('/reports/organizations');
  return res.data.data;
}