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

export async function refundPayment(id) {
  const res = await api.put(`/payments/${id}/refund`);
  return res.data;
}

export async function completePayment(id) {
  const res = await api.put(`/payments/${id}/complete`);
  return res.data;
}

export async function deletePayment(id) {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
}