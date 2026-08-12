import api from './api';

export async function getTotalUsage() {
  const res = await api.get('/usage/total');
  return res.data;
}

export async function getFarmsUsage() {
  const res = await api.get('/usage/farms');
  return res.data;
}

export async function getFarmUsage(id) {
  const res = await api.get(`/usage/farm/${id}`);
  return res.data;
}

export async function getUserUsage(id) {
  const res = await api.get(`/usage/user/${id}`);
  return res.data;
}

export async function updateLimits(data) {
  const res = await api.put('/usage/limits', data);
  return res.data;
}