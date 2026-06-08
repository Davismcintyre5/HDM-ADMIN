import api from './api';

export async function getTransactions(params = {}) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function getTransaction(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function processRefund(id, data) {
  const res = await api.post(`/payments/${id}/refund`, data);
  return res.data;
}

export async function approvePayment(id) {
  const res = await api.post(`/payments/${id}/approve`);
  return res.data;
}

export async function rejectPayment(id, reason) {
  const res = await api.post(`/payments/${id}/reject`, { reason });
  return res.data;
}

export async function createManualInvoice(data) {
  const res = await api.post('/payments/manual', data);
  return res.data;
}

export async function getSubscriptions(params = {}) {
  const res = await api.get('/payments/subscriptions/all', { params });
  return res.data;
}