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

export async function retryPayment(id) {
  const res = await api.post(`/payments/${id}/retry`);
  return res.data;
}

export async function refundPayment(id, data) {
  const res = await api.post(`/payments/${id}/refund`, data);
  return res.data;
}

export async function deletePayment(id) {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
}