import api from './api';

export async function getLegalDocs() {
  const res = await api.get('/legal');
  return res.data.data;
}

export async function getLegalDoc(type) {
  const res = await api.get(`/legal/${type}`);
  return res.data.data;
}

export async function saveLegalDoc(type, data) {
  const res = await api.put(`/legal/${type}`, data);
  return res.data;
}

export async function publishLegalDoc(type, version) {
  const res = await api.post(`/legal/${type}/publish`, { version });
  return res.data;
}