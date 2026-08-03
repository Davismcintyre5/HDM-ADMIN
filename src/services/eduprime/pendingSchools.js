import api from './api';

export async function getPendingSchools(params) {
  const res = await api.get('/pending-schools', { params });
  return res.data;
}

export async function getPendingSchool(id) {
  const res = await api.get(`/pending-schools/${id}`);
  return res.data;
}

export async function approveSchool(id) {
  const res = await api.patch(`/pending-schools/${id}/approve`);
  return res.data;
}

export async function rejectSchool(id, reason) {
  const res = await api.patch(`/pending-schools/${id}/reject`, { reason });
  return res.data;
}