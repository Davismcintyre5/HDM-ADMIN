import api from './api';

export async function getSupportContent(params) {
  const res = await api.get('/support-content', { params });
  return res.data;
}

export async function createSupportContent(data) {
  const res = await api.post('/support-content', data);
  return res.data;
}

export async function updateSupportContent(id, data) {
  const res = await api.put(`/support-content/${id}`, data);
  return res.data;
}

export async function deleteSupportContent(id) {
  const res = await api.delete(`/support-content/${id}`);
  return res.data;
}