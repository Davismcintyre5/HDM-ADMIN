import api from './api';

export async function getCommunication() {
  const res = await api.get('/communication');
  return res.data.data; // { templates }
}

export async function updateCommunication(data) {
  const res = await api.put('/communication', data);
  return res.data.data;
}