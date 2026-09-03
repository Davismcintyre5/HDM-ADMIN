import api from './api';

export async function getLegals() {
  const res = await api.get('/legals');
  return res.data;
}

export async function getLegal(id) {
  const res = await api.get(`/legals/${id}`);
  return res.data;
}

export async function createLegal(data) {
  const res = await api.post('/legals', data);
  return res.data;
}

export async function updateLegal(id, data) {
  const res = await api.put(`/legals/${id}`, data);
  return res.data;
}

export async function deleteLegal(id) {
  const res = await api.delete(`/legals/${id}`);
  return res.data;
}