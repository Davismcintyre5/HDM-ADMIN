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

export async function createManualPayment(data) {
  const res = await api.post('/payments/manual', data);
  return res.data;
}

export async function refundPayment(id, reason) {
  const res = await api.put(`/payments/${id}/refund`, { reason });
  return res.data;
}