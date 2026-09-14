import api from './api';

export async function getLegals(params) {
  const res = await api.get('/legal', { params });
  return res.data;
}

export async function createLegal(data) {
  const res = await api.post('/legal', data);
  return res.data;
}

export async function getLegal(id) {
  const res = await api.get(`/legal/${id}`);
  return res.data;
}

export async function updateLegal(id, data) {
  const res = await api.put(`/legal/${id}`, data);
  return res.data;
}

export async function activateLegal(id) {
  const res = await api.post(`/legal/${id}/activate`);
  return res.data;
}

export async function deactivateLegal(id) {
  const res = await api.post(`/legal/${id}/deactivate`);
  return res.data;
}

export async function getLegalHistory(type) {
  const res = await api.get(`/legal/type/${type}/history`);
  return res.data;
}

export async function getLegalAcceptances(type) {
  const res = await api.get(`/legal/type/${type}/acceptances`);
  return res.data;
}

export async function deleteLegal(id) {
  const res = await api.delete(`/legal/${id}`);
  return res.data;
}