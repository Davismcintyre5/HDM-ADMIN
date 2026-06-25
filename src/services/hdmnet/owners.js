import api from './api';

export async function getOwners(params = {}) {
  const res = await api.get('/admin/owners', { params });
  return res.data;
}

export async function getOwner(id) {
  const res = await api.get(`/admin/owners/${id}`);
  return res.data;
}

export async function approveOwner(id, approved = true) {
  const res = await api.post(`/admin/owners/${id}/approve`, { approved });
  return res.data;
}

export async function suspendOwner(id) {
  const res = await api.post(`/admin/owners/${id}/suspend`);
  return res.data;
}

export async function deleteOwner(id) {
  const res = await api.delete(`/admin/owners/${id}`);
  return res.data;
}