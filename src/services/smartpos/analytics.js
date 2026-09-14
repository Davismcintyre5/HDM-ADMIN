import api from './api';

export async function getSignups(days = 30) {
  const res = await api.get('/analytics/signups', { params: { days } });
  return res.data;
}

export async function getTrialConversion() {
  const res = await api.get('/analytics/trial-conversion');
  return res.data;
}

export async function getChurn() {
  const res = await api.get('/analytics/churn');
  return res.data;
}

export async function getPlanDistribution() {
  const res = await api.get('/analytics/plan-distribution');
  return res.data;
}

export async function getCurrencyDistribution() {
  const res = await api.get('/analytics/currency-distribution');
  return res.data;
}

export async function getStatusDistribution() {
  const res = await api.get('/analytics/status-distribution');
  return res.data;
}