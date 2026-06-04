import api from './api';

export async function getMaintenance() {
  const res = await api.get('/maintenance');
  return res.data;
}

export async function updateMaintenance(data) {
  const res = await api.put('/maintenance', data);
  return res.data;
}