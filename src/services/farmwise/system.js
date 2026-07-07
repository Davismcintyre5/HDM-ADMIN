import api from './api';

export async function getMetrics() {
  const res = await api.get('/system/metrics');
  return res.data;
}

export async function getConfig() {
  const res = await api.get('/system/config');
  return res.data;
}

export async function updateConfig(data) {
  const res = await api.put('/system/config', data);
  return res.data;
}

export async function toggleMaintenance() {
  const res = await api.post('/system/maintenance');
  return res.data;
}

export async function getDownloads() {
  const res = await api.get('/system/downloads');
  return res.data;
}

export async function updateDownloads(data) {
  const res = await api.put('/system/downloads', data);
  return res.data;
}