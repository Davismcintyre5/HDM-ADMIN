import api from './api';

export async function getWeatherSettings() {
  const res = await api.get('/settings/weather');
  return res.data;
}

export async function updateWeatherSettings(data) {
  const res = await api.put('/settings/weather', data);
  return res.data;
}

export async function testWeatherProvider(data) {
  const res = await api.post('/settings/weather/test', data);
  return res.data;
}

export async function getApiKeySettings() {
  const res = await api.get('/settings/api-keys');
  return res.data;
}

export async function updateApiKeySettings(data) {
  const res = await api.put('/settings/api-keys', data);
  return res.data;
}

export async function getBrandSettings() {
  const res = await api.get('/settings/brand');
  return res.data;
}

export async function updateBrandSettings(data) {
  const res = await api.put('/settings/brand', data);
  return res.data;
}

export async function getAiSettings() {
  const res = await api.get('/settings/ai');
  return res.data;
}