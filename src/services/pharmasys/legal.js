import api from './api';

export async function getLegalList() {
  const res = await api.get('/legal');
  return res.data;
}

export async function getLegal(id) {
  const res = await api.get(`/legal/${id}`);
  return res.data;
}

export async function publishLegal(data) {
  const res = await api.post('/legal', data);
  return res.data;
}

export async function setCurrentLegal(id) {
  const res = await api.post(`/legal/${id}/set-current`);
  return res.data;
}