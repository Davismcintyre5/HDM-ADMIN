import api from './api';

export async function getLegalDocs() {
  const res = await api.get('/legal');
  return res.data;
}

export async function getLegalDoc(slug) {
  const res = await api.get(`/legal/${slug}`);
  return res.data;
}

export async function getLegalVersions(slug) {
  const res = await api.get(`/legal/${slug}/versions`);
  return res.data;
}

export async function createLegalDoc(data) {
  const res = await api.post('/legal', data);
  return res.data;
}

export async function updateLegalDoc(slug, data) {
  const res = await api.patch(`/legal/${slug}`, data);
  return res.data;
}

export async function publishLegalDoc(slug) {
  const res = await api.post(`/legal/${slug}/publish`);
  return res.data;
}