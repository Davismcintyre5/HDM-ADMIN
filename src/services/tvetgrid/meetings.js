import api from './api';

export async function getMeetings(params) {
  const res = await api.get('/meetings', { params });
  return res.data;
}

export async function getMeeting(id) {
  const res = await api.get(`/meetings/${id}`);
  return res.data;
}

export async function getMeetingAttendance(id) {
  const res = await api.get(`/meetings/${id}/attendance`);
  return res.data;
}

export async function getMeetingRecording(id) {
  const res = await api.get(`/meetings/${id}/recording`);
  return res.data;
}