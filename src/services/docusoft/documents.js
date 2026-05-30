import api from './api';

export async function getDocuments(params = {}) {
  const res = await api.get('/documents', { params });
  return res.data;
}

export async function getDocument(id) {
  const res = await api.get(`/documents/${id}`);
  return res.data;
}

export async function createDocument(formData) {
  const res = await api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateDocument(id, formData) {
  const res = await api.put(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteDocument(id) {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
}