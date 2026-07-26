import api from './api';

export async function getModerationQueue() {
  const res = await api.get('/moderation/queue');
  return res.data;
}

export async function approveContent(id, data) {
  const res = await api.post(`/moderation/${id}/approve`, data);
  return res.data;
}

export async function removeContent(id, data) {
  const res = await api.post(`/moderation/${id}/remove`, data);
  return res.data;
}

export async function warnUser(id, data) {
  const res = await api.post(`/moderation/${id}/warn`, data);
  return res.data;
}

export async function getModerationHistory() {
  const res = await api.get('/moderation/history');
  return res.data;
}