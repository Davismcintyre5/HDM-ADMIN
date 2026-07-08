import api from './api';

export async function getCommissions() {
  const res = await api.get('/commissions');
  return res.data;
}

export async function setDefaultCommission(rate) {
  const res = await api.post('/commissions/default', { rate });
  return res.data;
}

export async function setStoreCommission(storeId, rate) {
  const res = await api.post('/commissions/store', { storeId, rate });
  return res.data;
}

export async function setCategoryCommission(categoryId, rate) {
  const res = await api.post('/commissions/category', { categoryId, rate });
  return res.data;
}

export async function deleteCommission(id) {
  const res = await api.delete(`/commissions/${id}`);
  return res.data;
}