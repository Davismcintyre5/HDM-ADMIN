import api from './api';

export async function getCurrencies() {
  const res = await api.get('/currency');
  return res.data;
}

export async function updateCurrency(id, data) {
  const res = await api.put(`/currency/${id}`, data);
  return res.data;
}

export async function toggleCurrency(id) {
  const res = await api.put(`/currency/${id}/toggle`);
  return res.data;
}

export async function setDefaultCurrency(id) {
  const res = await api.put(`/currency/default/${id}`);
  return res.data;
}

export async function getExchangeRates() {
  const res = await api.get('/currency/rates/all');
  return res.data;
}

export async function updateExchangeRates(data) {
  const res = await api.post('/currency/rates', data);
  return res.data;
}