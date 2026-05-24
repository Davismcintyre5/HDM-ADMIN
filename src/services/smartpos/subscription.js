import api from './api';

export async function getSubscription() {
  const res = await api.get('/subscription');
  return res.data.data; // { plan }
}

export async function updateSubscription(data) {
  const res = await api.put('/subscription', data);
  return res.data.data;
}