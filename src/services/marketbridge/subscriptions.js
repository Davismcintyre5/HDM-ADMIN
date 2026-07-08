import api from './api';

export async function getPlans() {
  const res = await api.get('/subscriptions/plans');
  return res.data;
}

export async function createPlan(data) {
  const res = await api.post('/subscriptions/plans', data);
  return res.data;
}

export async function updatePlan(id, data) {
  const res = await api.put(`/subscriptions/plans/${id}`, data);
  return res.data;
}

export async function assignPlanToStore(storeId, planId) {
  const res = await api.put(`/subscriptions/stores/${storeId}/assign`, { planId });
  return res.data;
}