import api from './api';

export async function getNotifications(params) {
  const res = await api.get('/notifications', { params });
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data;
}

export async function markRead(id) {
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllRead() {
  const res = await api.post('/notifications/read-all');
  return res.data;
}