import api from './api';

export async function getSystems() {
  const res = await api.get('/systems');
  return res.data;
}

export async function updateSystems(data) {
  const res = await api.put('/systems', data);
  return res.data;
}