import api from './api';

export async function getPlans() { const res = await api.get('/plans'); return res.data.data; }
export async function createPlan(plan) { const res = await api.post('/plans', plan); return res.data.data; }
export async function updatePlan(id, plan) { const res = await api.put(`/plans/${id}`, plan); return res.data.data; }
export async function deletePlan(id) { const res = await api.delete(`/plans/${id}`); return res.data; }