import api from './api';

export async function getReports(params) {
  const res = await api.get('/reports', { params });
  return res.data;
}

export async function getReport(id) {
  const res = await api.get(`/reports/${id}`);
  return res.data;
}

export async function resolveReport(id, data) {
  const res = await api.post(`/reports/${id}/resolve`, data);
  return res.data;
}

export async function dismissReport(id, data) {
  const res = await api.post(`/reports/${id}/dismiss`, data);
  return res.data;
}

export async function getReportStats() {
  const res = await api.get('/reports/stats');
  return res.data;
}