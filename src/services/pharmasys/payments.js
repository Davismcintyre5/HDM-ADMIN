import api from './api';

export async function getPayments(params) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function getPayment(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function getPaymentAttempts(id) {
  const res = await api.get(`/payments/${id}/attempts`);
  return res.data;
}

export async function markPaymentPaid(id, data) {
  const res = await api.post(`/payments/${id}/mark-paid`, data);
  return res.data;
}

export async function markPaymentFailed(id, data) {
  const res = await api.post(`/payments/${id}/mark-failed`, data);
  return res.data;
}

export async function refundPayment(id, data) {
  const res = await api.post(`/payments/${id}/refund`, data);
  return res.data;
}

export async function getPaymentStats() {
  const res = await api.get('/payments/stats');
  return res.data;
}