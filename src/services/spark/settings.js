import api from './api';

export async function getSettings() {
  const res = await api.get('/settings');
  return res.data.data;
}

export async function updateSettings(data) {
  const res = await api.patch('/settings', data);
  return res.data;
}

export async function getSoundPacks() {
  const res = await api.get('/settings/sound-packs');
  return res.data.data;
}

export async function createSoundPack(data) {
  const res = await api.post('/settings/sound-packs', data);
  return res.data;
}

export async function updateSoundPack(packId, data) {
  const res = await api.patch(`/settings/sound-packs/${packId}`, data);
  return res.data;
}

export async function deleteSoundPack(packId) {
  const res = await api.delete(`/settings/sound-packs/${packId}`);
  return res.data;
}