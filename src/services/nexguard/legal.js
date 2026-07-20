import api from './api';

export async function getLegalDocs() {
  const res = await api.get('/legal');
  return res.data;
}

export async function createLegalDoc(data) {
  const res = await api.post('/legal', data);
  return res.data;
}

export async function updateLegalDoc(id, data) {
  const res = await api.patch(`/legal/${id}`, data);
  return res.data;
}

export async function publishLegalDoc(id) {
  const res = await api.patch(`/legal/${id}/publish`);
  return res.data;
}

export async function deleteLegalDoc(id) {
  const res = await api.delete(`/legal/${id}`);
  return res.data;
}