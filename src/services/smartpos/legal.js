import api from './api';

export async function getLegalList(type) {
  const res = await api.get('/legal', { params: type ? { type } : undefined });
  return res.data;
}

export async function getLegalByType(type) {
  const res = await api.get(`/legal/${type}`);
  return res.data;
}

export async function getLegalCurrent(type) {
  const res = await api.get(`/legal/${type}/current`);
  return res.data;
}

export async function getLegalByVersion(type, version) {
  const res = await api.get(`/legal/${type}/${version}`);
  return res.data;
}

export async function publishLegal(type, data) {
  const res = await api.post(`/legal/${type}/publish`, data);
  return res.data;
}

export async function updateLegalDraft(id, data) {
  const res = await api.patch(`/legal/${id}`, data);
  return res.data;
}

export async function deleteLegalDraft(id) {
  const res = await api.delete(`/legal/${id}`);
  return res.data;
}