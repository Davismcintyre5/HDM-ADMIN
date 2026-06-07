import api from './api';

export async function getDocuments() {
  const res = await api.get('/legal');
  return res.data;
}

export async function getDocument(id) {
  const res = await api.get(`/legal/${id}`);
  return res.data;
}

export async function createDocument(data) {
  const res = await api.post('/legal', data);
  return res.data;
}

export async function updateDocument(id, data) {
  const res = await api.put(`/legal/${id}`, data);
  return res.data;
}

export async function publishDocument(id) {
  const res = await api.put(`/legal/${id}/publish`);
  return res.data;
}

export async function deleteDocument(id) {
  const res = await api.delete(`/legal/${id}`);
  return res.data;
}

export async function getConsents(params = {}) {
  const res = await api.get('/legal/consents/all', { params });
  return res.data;
}