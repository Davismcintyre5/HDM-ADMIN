import { get, patch } from './api';

export async function getPaymentMethods() {
  const { data } = await get('/payment-methods');
  return data || [];
}

export async function updatePaymentMethod(id, payload) {
  const { data } = await patch(`/payment-methods/${id}`, payload);
  return data;
}