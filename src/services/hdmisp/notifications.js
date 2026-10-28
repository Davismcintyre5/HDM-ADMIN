import { get, post, del } from './api';

export async function getNotifications(params = {}) {
  const { data, meta } = await get('/notifications', { params });
  return { data: data || [], meta };
}

export async function getUnreadCount() {
  const { data } = await get('/notifications/unread-count');
  return data?.count ?? 0;
}

export async function markNotificationRead(id) {
  const { data } = await post(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await post('/notifications/read-all');
  return data;
}

export async function deleteNotification(id) {
  const { data } = await del(`/notifications/${id}`);
  return data;
}