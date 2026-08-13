import api from './api';

export async function getMarketStatus() {
  const res = await api.get('/market/status');
  return res.data;
}

export async function toggleMarket() {
  const res = await api.put('/market/toggle');
  return res.data;
}

export async function getFarmers() {
  const res = await api.get('/market/farmers');
  return res.data;
}

export async function getProducts(params) {
  const res = await api.get('/market/products', { params });
  return res.data;
}

export async function getProduct(id) {
  const res = await api.get(`/market/products/${id}`);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/market/products/${id}`);
  return res.data;
}

export async function getInquiries() {
  const res = await api.get('/market/inquiries');
  return res.data;
}