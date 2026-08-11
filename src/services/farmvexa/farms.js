import api from './api';

export async function getFarms(params) {
  const res = await api.get('/farms', { params });
  return res.data;
}

export async function getFarm(id) {
  const res = await api.get(`/farms/${id}`);
  return res.data;
}

export async function approveFarm(id) {
  const res = await api.put(`/farms/${id}/approve`);
  return res.data;
}

export async function suspendFarm(id, data) {
  const res = await api.put(`/farms/${id}/suspend`, data);
  return res.data;
}

export async function updateSubscription(id, data) {
  const res = await api.put(`/farms/${id}/subscription`, data);
  return res.data;
}