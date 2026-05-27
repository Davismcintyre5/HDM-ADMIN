import api from './api';

export async function getFlaggedMessages(params = {}) {
  const res = await api.get('/moderation/messages', { params });
  return res.data;
}

export async function removeContent(contentId, data) {
  const res = await api.delete(`/moderation/content/${contentId}`, { data });
  return res.data;
}

export async function bulkRemoveUserContent(userId) {
  const res = await api.delete(`/moderation/users/${userId}/content`);
  return res.data;
}

export async function warnUser(userId, data) {
  const res = await api.post(`/moderation/users/${userId}/warn`, data);
  return res.data;
}

export async function getModerationLogs(params = {}) {
  const res = await api.get('/moderation/logs', { params });
  return res.data;
}

export async function getBlockedWords() {
  const res = await api.get('/moderation/blocked-words');
  return res.data.data;
}

export async function addBlockedWord(word) {
  const res = await api.post('/moderation/blocked-words', { word });
  return res.data;
}

export async function deleteBlockedWord(word) {
  const res = await api.delete(`/moderation/blocked-words/${word}`);
  return res.data;
}