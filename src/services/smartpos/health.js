import api from './api';

export async function getHealth() {
  const res = await api.get('/system-health');
  return res.data;
}