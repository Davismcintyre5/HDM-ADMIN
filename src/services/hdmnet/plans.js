import api from './api';

export async function getPlans() {
  const res = await api.get('/admin/owner-plans');
  return res.data;
}

export async function getPlan(id) {
  const res = await api.get(`/admin/owner-plans/${id}`);
  return res.data;
}

export async function createPlan(data) {
  const res = await api.post('/admin/owner-plans', data);
  return res.data;
}

export async function updatePlan(id, data) {
  const res = await api.put(`/admin/owner-plans/${id}`, data);
  return res.data;
}

export async function deletePlan(id) {
  const res = await api.delete(`/admin/owner-plans/${id}`);
  return res.data;
}