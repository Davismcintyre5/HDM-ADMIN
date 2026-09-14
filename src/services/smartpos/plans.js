import api from './api';

export async function getPlans(params) {
  const res = await api.get('/plans', { params });
  return res.data;
}

export async function getPlan(id) {
  const res = await api.get(`/plans/${id}`);
  return res.data;
}

export async function updatePlan(id, data) {
  const res = await api.put(`/plans/${id}`, data);
  return res.data;
}

export async function togglePlan(id) {
  const res = await api.post(`/plans/${id}/toggle`);
  return res.data;
}

export async function syncStripePlan(id) {
  const res = await api.post(`/plans/${id}/sync-stripe`);
  return res.data;
}