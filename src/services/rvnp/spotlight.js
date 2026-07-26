import api from './api';

export async function getSpotlights() {
  const res = await api.get('/spotlight');
  return res.data;
}

export async function featurePost(postId, data) {
  const res = await api.post(`/spotlight/${postId}`, data);
  return res.data;
}

export async function removeSpotlight(postId) {
  const res = await api.delete(`/spotlight/${postId}`);
  return res.data;
}

export async function extendSpotlight(postId, data) {
  const res = await api.patch(`/spotlight/${postId}/extend`, data);
  return res.data;
}

export async function getSpotlightHistory() {
  const res = await api.get('/spotlight/history');
  return res.data;
}

export async function getSpotlightQueue() {
  const res = await api.get('/spotlight/queue');
  return res.data;
}