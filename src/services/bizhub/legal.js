import api from './api';

export async function getLegalDocs(status) {
  const res = await api.get('/legal', { params: { status } });
  return res.data?.data || res.data;
}

export async function getLegalDoc(type) {
  const res = await api.get(`/legal/${type}`);
  return res.data?.data || res.data;
}

export async function createLegalDoc(data) {
  const res = await api.post('/legal', data);
  return res.data?.data || res.data;
}

export async function updateLegalDoc(type, data) {
  const res = await api.put(`/legal/${type}`, data);
  return res.data?.data || res.data;
}

export async function publishLegalDoc(type) {
  const res = await api.put(`/legal/${type}/publish`);
  return res.data?.data || res.data;
}

export async function archiveLegalDoc(type) {
  const res = await api.put(`/legal/${type}/archive`);
  return res.data?.data || res.data;
}