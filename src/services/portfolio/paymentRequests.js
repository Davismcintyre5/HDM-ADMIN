import api from './api';

export async function getPaymentRequests(params) {
  const res = await api.get('/payment-requests', { params });
  return res.data;
}

export async function getPaymentRequest(id) {
  const res = await api.get(`/payment-requests/${id}`);
  return res.data;
}

export async function createPaymentRequest(data) {
  const res = await api.post('/payment-requests', data);
  return res.data;
}

export async function initiatePaymentRequest(id) {
  const res = await api.post(`/payment-requests/${id}/initiate`);
  return res.data;
}

export async function cancelPaymentRequest(id) {
  const res = await api.post(`/payment-requests/${id}/cancel`);
  return res.data;
}

export async function deletePaymentRequest(id) {
  const res = await api.delete(`/payment-requests/${id}`);
  return res.data;
}