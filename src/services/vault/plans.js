import api from './api';

export async function getPlans() {
  const res = await api.get('/plans');
  return res.data.data;
}

export async function updatePlans(data) {
  const res = await api.put('/plans', data);
  return res.data;
}

export async function updatePlanTier(tier, data) {
  const res = await api.put(`/plans/${tier}`, data);
  return res.data;
}