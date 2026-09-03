import api from './api';

export async function getReports(params) {
  const res = await api.get('/reports', { params });
  return res.data;
}

export async function getReport(id) {
  const res = await api.get(`/reports/${id}`);
  return res.data;
}

export async function updateReportStatus(id, data) {
  const res = await api.put(`/reports/${id}/status`, data);
  return res.data;
}

export async function deleteReport(id) {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
}