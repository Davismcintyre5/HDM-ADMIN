import api from './api';

export async function getAdminHealth() {
  const res = await api.get('/health');
  return res.data;
}