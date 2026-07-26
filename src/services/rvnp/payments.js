import api from './api';

export async function getPayments(params) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function getPayment(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function verifyPayment(id) {
  const res = await api.post(`/payments/${id}/verify`);
  return res.data;
}

export async function refundPayment(id, data) {
  const res = await api.post(`/payments/${id}/refund`, data);
  return res.data;
}

export async function getTransactions() {
  const res = await api.get('/payments/transactions');
  return res.data;
}

export async function getRevenue() {
  const res = await api.get('/payments/revenue');
  return res.data;
}