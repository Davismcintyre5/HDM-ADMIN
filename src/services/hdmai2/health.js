import api from './api';

export async function getHealth() {
  const res = await api.get('/health');
  return res.data;
}

export async function getHealthHistory() {
  const res = await api.get('/health/history');
  return res.data;
}