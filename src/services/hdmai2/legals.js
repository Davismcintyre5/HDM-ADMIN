import api from './api';

export async function getLegals(params) {
  const res = await api.get('/legal', { params });
  return res.data;
}

export async function createLegal(data) {
  const res = await api.post('/legal', data);
  return res.data;
}

export async function updateLegal(id, data) {
  const res = await api.put(`/legal/${id}`, data);
  return res.data;
}

export async function deleteLegal(id) {
  const res = await api.delete(`/legal/${id}`);
  return res.data;
}

export async function publishLegal(id) {
  const res = await api.put(`/legal/${id}/publish`);
  return res.data;
}

export async function archiveLegal(id) {
  const res = await api.put(`/legal/${id}/archive`);
  return res.data;
}