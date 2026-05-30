import api from './api';

export async function getAllOrders() {
  const res = await api.get('/orders/all');
  return res.data;
}