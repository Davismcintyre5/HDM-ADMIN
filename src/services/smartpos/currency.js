import api from './api';

export async function getCurrency() {
  const res = await api.get('/currency');
  return res.data.data; // { currency, available }
}

export async function updateCurrency(data) {
  const res = await api.put('/currency', data);
  return res.data.data;
}