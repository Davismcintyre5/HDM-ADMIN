import api from './api';

export async function getPlans() {
  const res = await api.get('/plans');
  return res.data;
}

export async function getPlan(id) {
  const res = await api.get(`/plans/${id}`);
  return res.data;
}

export async function createPlan(data) {
  const res = await api.post('/plans', data);
  return res.data;
}

export async function updatePlan(id, data) {
  const res = await api.put(`/plans/${id}`, data);
  return res.data;
}

export async function deletePlan(id) {
  const res = await api.delete(`/plans/${id}`);
  return res.data;
}

export async function togglePlan(id) {
  const res = await api.put(`/plans/${id}/toggle`);
  return res.data;
}