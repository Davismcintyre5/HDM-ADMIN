import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateGeneral(data) {
  const res = await api.patch('/settings/general', data);
  return res.data;
}

export async function updateAI(data) {
  const res = await api.patch('/settings/ai', data);
  return res.data;
}

export async function updateEmail(data) {
  const res = await api.patch('/settings/email', data);
  return res.data;
}

export async function updateSMS(data) {
  const res = await api.patch('/settings/sms', data);
  return res.data;
}

export async function updateToggles(data) {
  const res = await api.patch('/settings/toggles', data);
  return res.data;
}

export async function updateUploads(data) {
  const res = await api.patch('/settings/uploads', data);
  return res.data;
}

export async function updateDownloads(data) {
  const res = await api.patch('/settings/downloads', data);
  return res.data;
}

export async function updateBadges(data) {
  const res = await api.patch('/settings/badges', data);
  return res.data;
}

export async function updateScoring(data) {
  const res = await api.patch('/settings/scoring', data);
  return res.data;
}

export async function updateLimits(data) {
  const res = await api.patch('/settings/limits', data);
  return res.data;
}

export async function updateLegals(data) {
  const res = await api.patch('/settings/legals', data);
  return res.data;
}

export async function testEmail(data) {
  const res = await api.post('/settings/email/test', data);
  return res.data;
}

export async function testSMS(data) {
  const res = await api.post('/settings/sms/test', data);
  return res.data;
}