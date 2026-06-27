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

export async function getCosts() {
  const res = await api.get('/financial/costs');
  return res.data;
}

export async function createCost(data) {
  const res = await api.post('/financial/costs', data);
  return res.data;
}

export async function updateCost(id, data) {
  const res = await api.put(`/financial/costs/${id}`, data);
  return res.data;
}

export async function deleteCost(id) {
  const res = await api.delete(`/financial/costs/${id}`);
  return res.data;
}