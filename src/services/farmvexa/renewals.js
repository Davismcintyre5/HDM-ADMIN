import api from './api';

export async function getRenewals(params) {
  const res = await api.get('/renewals', { params });
  return res.data;
}

export async function approveRenewal(id) {
  const res = await api.put(`/renewals/${id}/approve`);
  return res.data;
}

export async function rejectRenewal(id, data) {
  const res = await api.put(`/renewals/${id}/reject`, data);
  return res.data;
}