import api from './api';

export async function getAttemptsAnalytics(params) {
  const res = await api.get('/analytics/attempts', { params });
  return res.data;
}

export async function getMasteryAnalytics(params) {
  const res = await api.get('/analytics/mastery', { params });
  return res.data;
}

export async function getAttendanceAnalytics(params) {
  const res = await api.get('/analytics/attendance', { params });
  return res.data;
}

export async function getInvitesAnalytics() {
  const res = await api.get('/analytics/invites');
  return res.data;
}