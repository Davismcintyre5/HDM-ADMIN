import api from './api';

export async function getPaymentMethods() {
  const res = await api.get('/payments');
  return res.data;
}

export async function createPaymentMethod(data) {
  const res = await api.post('/payments', data);
  return res.data;
}

export async function updatePaymentMethod(id, data) {
  const res = await api.put(`/payments/${id}`, data);
  return res.data;
}

export async function togglePaymentMethod(id) {
  const res = await api.patch(`/payments/${id}/toggle`);
  return res.data;
}

export async function deletePaymentMethod(id) {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
}