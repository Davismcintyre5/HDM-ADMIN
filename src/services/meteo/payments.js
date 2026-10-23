import api from './api';

export async function getPayments(params) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function getPayment(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function refundPayment(id, data) {
  const res = await api.post(`/payments/${id}/refund`, data);
  return res.data;
}