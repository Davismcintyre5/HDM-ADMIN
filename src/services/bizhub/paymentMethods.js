import api from './api';

export async function getPaymentMethods() {
  const res = await api.get('/payment-methods');
  return res.data;
}

export async function updatePaymentMethods(data) {
  const res = await api.put('/payment-methods', data);
  return res.data;
}