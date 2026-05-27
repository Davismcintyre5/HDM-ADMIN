import api from './api';

export async function getAIConfig() {
  const res = await api.get('/ai/config');
  return res.data.data;
}

export async function updateAIConfig(data) {
  const res = await api.patch('/ai/config', data);
  return res.data;
}

export async function getFeatureStatuses() {
  const res = await api.get('/ai/config/features');
  return res.data.data;
}

export async function toggleFeature(featureName, enabled) {
  const res = await api.patch(`/ai/config/features/${featureName}`, { enabled });
  return res.data;
}

export async function updateThresholds(data) {
  const res = await api.patch('/ai/config/thresholds', data);
  return res.data;
}

export async function updateRateLimits(data) {
  const res = await api.patch('/ai/config/rate-limits', data);
  return res.data;
}

export async function updateAutoModeration(data) {
  const res = await api.patch('/ai/config/auto-moderation', data);
  return res.data;
}

export async function updateLanguages(data) {
  const res = await api.patch('/ai/config/languages', data);
  return res.data;
}

export async function updateLogging(data) {
  const res = await api.patch('/ai/config/logging', data);
  return res.data;
}

export async function resetToDefaults() {
  const res = await api.post('/ai/config/reset');
  return res.data;
}