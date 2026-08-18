import api from './api';

export async function getUpgrades(params) {
  const res = await api.get('/plans/upgrades', { params });
  return res.data;
}

export async function approveUpgrade(id, data) {
  const res = await api.put(`/plans/upgrades/${id}/approve`, data);
  return res.data;
}

export async function rejectUpgrade(id, data) {
  const res = await api.put(`/plans/upgrades/${id}/reject`, data);
  return res.data;
}