import api from './api';

export async function getLegals() {
  const res = await api.get('/legals');
  return res.data;
}

export async function getLegal(type) {
  const res = await api.get(`/legals/${type}`);
  return res.data;
}

export async function saveLegal(type, data) {
  const res = await api.put(`/legals/${type}`, data);
  return res.data;
}