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

export async function getLegalHistory(type) {
  const res = await api.get(`/legal/${type}/history`);
  return res.data.data;
}