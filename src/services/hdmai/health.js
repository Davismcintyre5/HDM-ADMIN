import api from './api';

export async function getAdminHealth() {
  const res = await api.get('/admin/health');
  return res.data.data;
}

export async function getProjectKeys() {
  const res = await api.get('/admin/project-keys');
  return res.data.data;
}

export async function getPublicHealth() {
  const res = await api.get('/health', { baseURL: api.defaults.baseURL });
  return res.data;
}