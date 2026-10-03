import api from './api';

export async function getPaymentMethods() {
  const res = await api.get('/payment-methods');
  return res.data;
}

export async function updatePaymentMethod(id, data) {
  const res = await api.patch(`/payment-methods/${id}`, data);
  return res.data;
}