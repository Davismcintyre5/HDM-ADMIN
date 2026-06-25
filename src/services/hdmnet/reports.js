import api from './api';

export async function getRevenue(ownerId) {
  const res = await api.get(`/admin/reports/${ownerId}/revenue`);
  return res.data;
}

export async function getActiveUsers(ownerId) {
  const res = await api.get(`/admin/reports/${ownerId}/active-users`);
  return res.data;
}

export async function getDaily(ownerId, days = 7) {
  const res = await api.get(`/admin/reports/${ownerId}/daily`, { params: { days } });
  return res.data;
}