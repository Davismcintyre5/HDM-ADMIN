import api from './api';

export async function getWidgetSettings() {
  const res = await api.get('/ai-widget');
  return res.data;
}

export async function updateWidgetSettings(data) {
  const res = await api.put('/ai-widget', data);
  return res.data;
}

export async function testWidgetConnection() {
  const res = await api.post('/ai-widget/test');
  return res.data;
}

export async function toggleWidget() {
  const res = await api.put('/ai-widget/toggle');
  return res.data;
}