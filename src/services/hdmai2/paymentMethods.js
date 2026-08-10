import api from './api';

export async function getPaymentMethods() {
  const res = await api.get('/payment-methods');
  return res.data;
}

export async function createPaymentMethod(data) {
  const res = await api.post('/payment-methods', data);
  return res.data;
}

export async function updatePaymentMethod(id, data) {
  const res = await api.put(`/payment-methods/${id}`, data);
  return res.data;
}

export async function togglePaymentMethod(id) {
  const res = await api.put(`/payment-methods/${id}/toggle`);
  return res.data;
}

export async function deletePaymentMethod(id) {
  const res = await api.delete(`/payment-methods/${id}`);
  return res.data;
}