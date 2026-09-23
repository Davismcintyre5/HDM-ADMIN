import api from './api';

export async function getHealth() {
  const res = await api.get('/health');
  return res.data;
}

export async function getHealthReady() {
  const res = await api.get('/health/ready');
  return res.data;
}

export async function getHealthMetrics() {
  const res = await api.get('/health/metrics');
  return res.data;
}