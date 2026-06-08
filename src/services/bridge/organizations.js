import api from './api';

export async function getOrganizations(params = {}) {
  const res = await api.get('/organizations', { params });
  return res.data;
}

export async function getOrganization(id) {
  const res = await api.get(`/organizations/${id}`);
  return res.data;
}

export async function deleteOrganization(id) {
  const res = await api.delete(`/organizations/${id}`);
  return res.data;
}

export async function getOrgActivity(limit = 4) {
  const res = await api.get('/notifications/org-activity', { params: { limit } });
  return res.data;
}