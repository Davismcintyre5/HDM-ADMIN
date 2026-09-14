import api from './api';

export async function getRevenueSummary() {
  const res = await api.get('/revenue/summary');
  return res.data;
}

export async function getRevenueByPlan() {
  const res = await api.get('/revenue/by-plan');
  return res.data;
}

export async function getRevenueByCurrency() {
  const res = await api.get('/revenue/by-currency');
  return res.data;
}

export async function getRevenueByMethod() {
  const res = await api.get('/revenue/by-method');
  return res.data;
}

export async function getRevenueMonthly(months = 12) {
  const res = await api.get('/revenue/monthly', { params: { months } });
  return res.data;
}