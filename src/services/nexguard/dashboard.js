import api from './api';

export async function getOverview() {
  const res = await api.get('/dashboard/overview');
  return res.data;
}

export async function getStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
}

export async function getActiveAgents() {
  const res = await api.get('/dashboard/active-agents');
  return res.data;
}

export async function getThreatMap() {
  const res = await api.get('/dashboard/threat-map');
  return res.data;
}