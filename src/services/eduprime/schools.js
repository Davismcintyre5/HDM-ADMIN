import api from './api';

export async function getSchools(params) {
  const res = await api.get('/schools', { params });
  return res.data;
}

export async function getSchool(id) {
  const res = await api.get(`/schools/${id}`);
  return res.data;
}

export async function createSchool(data) {
  const res = await api.post('/schools', data);
  return res.data;
}

export async function updateSchool(id, data) {
  const res = await api.put(`/schools/${id}`, data);
  return res.data;
}

export async function suspendSchool(id) {
  const res = await api.patch(`/schools/${id}/suspend`);
  return res.data;
}

export async function reactivateSchool(id) {
  const res = await api.patch(`/schools/${id}/reactivate`);
  return res.data;
}

export async function deleteSchool(id) {
  const res = await api.delete(`/schools/${id}`);
  return res.data;
}