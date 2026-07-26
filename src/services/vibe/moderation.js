import api from './api';

export async function getFlagged(params = {}) {
  const res = await api.get('/moderation/flagged', { params });
  return res.data;
}

export async function removeContent(contentType, contentId) {
  const res = await api.put(`/moderation/${contentType}/${contentId}/remove`);
  return res.data;
}

export async function dismissContent(contentType, contentId) {
  const res = await api.put(`/moderation/${contentType}/${contentId}/dismiss`);
  return res.data;
}

export async function getReports(params = {}) {
  const res = await api.get('/moderation/reports', { params });
  return res.data;
}

export async function resolveReport(id, resolution) {
  const res = await api.put(`/moderation/reports/${id}/resolve`, { resolution });
  return res.data;
}

export async function dismissReport(id) {
  const res = await api.put(`/moderation/reports/${id}/dismiss`);
  return res.data;
}