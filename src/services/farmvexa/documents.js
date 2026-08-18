import api from './api';

const BASE_URL = import.meta.env.VITE_FARMVEXA_API || 'http://localhost:5000/api/admin';

export async function getDocuments() {
  const res = await api.get('/documents');
  return res.data;
}

export async function uploadDocument(formData, token) {
  const res = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

export async function updateDocument(id, data) {
  const res = await api.put(`/documents/${id}`, data);
  return res.data;
}

export async function deleteDocument(id) {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
}