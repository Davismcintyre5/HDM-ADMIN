import api from './api';

export async function getPaymentModels() {
  const res = await api.get('/payment-models');
  return res.data;
}

export async function createPaymentModel(data) {
  const res = await api.post('/payment-models', data);
  return res.data;
}

export async function updatePaymentModel(id, data) {
  const res = await api.put(`/payment-models/${id}`, data);
  return res.data;
}

export async function togglePaymentModel(id) {
  const res = await api.put(`/payment-models/${id}/toggle`);
  return res.data;
}

export async function deletePaymentModel(id) {
  const res = await api.delete(`/payment-models/${id}`);
  return res.data;
}