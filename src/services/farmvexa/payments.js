import api from './api';

export async function getPayments(params) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function getPaymentStats() {
  const res = await api.get('/payments/stats');
  return res.data;
}

export async function getPayment(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function verifyPayment(id) {
  const res = await api.put(`/payments/${id}/verify`);
  return res.data;
}

export async function rejectPayment(id, data) {
  const res = await api.put(`/payments/${id}/reject`, data);
  return res.data;
}