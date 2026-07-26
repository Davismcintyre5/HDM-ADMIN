import api from './api';

export async function getAnnouncements() {
  const res = await api.get('/announcements');
  return res.data;
}

export async function createAnnouncement(data) {
  const res = await api.post('/announcements', data);
  return res.data;
}

export async function updateAnnouncement(id, data) {
  const res = await api.patch(`/announcements/${id}`, data);
  return res.data;
}

export async function deleteAnnouncement(id) {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
}

export async function sendAnnouncement(id) {
  const res = await api.post(`/announcements/${id}/send`);
  return res.data;
}

export async function scheduleAnnouncement(id, data) {
  const res = await api.post(`/announcements/${id}/schedule`, data);
  return res.data;
}