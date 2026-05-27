import api from './api';

export async function updateCurrency(data) {
  const res = await api.patch('/settings/currency', data);
  return res.data;
}