import api from './api';

export async function getReports(params = {}) {
  const res = await api.get('/reports', { params });
  return res.data.data; // { reports, total, page, limit, totalPages }
}

export async function getReport(reportId) {
  const res = await api.get(`/reports/${reportId}`);
  return res.data.data;
}

export async function assignReport(reportId) {
  const res = await api.patch(`/reports/${reportId}/assign`);
  return res.data;
}

export async function resolveReport(reportId, data) {
  const res = await api.patch(`/reports/${reportId}/resolve`, data);
  return res.data;
}

export async function dismissReport(reportId, data) {
  const res = await api.patch(`/reports/${reportId}/dismiss`, data);
  return res.data;
}