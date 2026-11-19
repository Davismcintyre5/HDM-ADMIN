import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data;
}

export async function updateSettings(data) {
  const res = await api.put('/settings', data);
  return res.data;
}

// --- AI provider config (per feature) ---

export async function getAiConfig() {
  const res = await api.get('/settings/ai/config');
  return res.data;
}

export async function updateAiProvider(feature, provider) {
  const res = await api.put(`/settings/ai/config/${feature}`, { provider });
  return res.data;
}

export async function testAiProvider(feature, provider, { message, imageFile, cropType } = {}) {
  // Multipart if an image is provided; JSON otherwise.
  if (imageFile) {
    const form = new FormData();
    form.append('image', imageFile);
    if (message) form.append('message', message);
    if (cropType) form.append('cropType', cropType);
    const res = await api.post(
      `/settings/ai/test/${feature}/${provider}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  }
  const res = await api.post(
    `/settings/ai/test/${feature}/${provider}`,
    { message, cropType }
  );
  return res.data;
}