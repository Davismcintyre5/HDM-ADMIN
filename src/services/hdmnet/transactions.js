import api from './api';

export async function getTransactions(params) {
  const res = await api.get('/transactions', { params });
  return res.data;
}

export async function getTransaction(id) {
  const res = await api.get(`/transactions/${id}`);
  return res.data;
}

export async function getCommissionReport(params) {
  const res = await api.get('/transactions/commission-report', { params });
  return res.data;
}