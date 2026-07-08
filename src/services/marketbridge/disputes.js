import api from './api';

export async function getDisputes(params = {}) {
  const res = await api.get('/disputes', { params });
  return res.data;
}

export async function getDispute(id) {
  const res = await api.get(`/disputes/${id}`);
  return res.data;
}

export async function mediateDispute(id) {
  const res = await api.put(`/disputes/${id}/mediate`);
  return res.data;
}

export async function resolveDispute(id, data) {
  const res = await api.put(`/disputes/${id}/resolve`, data);
  return res.data;
}