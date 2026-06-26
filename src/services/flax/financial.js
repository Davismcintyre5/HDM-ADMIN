import api from './api';

export async function getFinancial() {
  const res = await api.get('/financial');
  return res.data;
}

export async function getFinancialStats() {
  const res = await api.get('/financial/stats');
  return res.data;
}

export async function updateFees(data) {
  const res = await api.put('/financial/fees', data);
  return res.data;
}

export async function updateLimits(data) {
  const res = await api.put('/financial/limits', data);
  return res.data;
}

export async function updateCurrency(data) {
  const res = await api.put('/financial/currency', data);
  return res.data;
}