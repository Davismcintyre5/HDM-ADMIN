import api from './api';

export async function getNotificationStats() {
  const res = await api.get('/notifications/stats');
  return res.data;
}

export async function sendToAll(data) {
  const res = await api.post('/notifications/send-to-all', data);
  return res.data;
}

export async function sendToUser(data) {
  const res = await api.post('/notifications/send-to-user', data);
  return res.data;
}