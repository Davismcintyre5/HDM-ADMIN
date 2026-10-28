import { get, post, patch, del } from './api';

export async function getBillingPlans() {
  const { data } = await get('/billing-plans');
  return data || [];
}

export async function createBillingPlan(payload) {
  const { data } = await post('/billing-plans', payload);
  return data;
}

export async function updateBillingPlan(id, payload) {
  const { data } = await patch(`/billing-plans/${id}`, payload);
  return data;
}

export async function deleteBillingPlan(id) {
  const { data } = await del(`/billing-plans/${id}`);
  return data;
}