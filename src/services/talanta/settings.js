// src/services/talanta/settings.js
import api from './api';

export const getSettings = async () => {
  const { data } = await api.get('/settings');
  return data?.data || data || [];
};

export const updateSettings = async (items) => {
  const { data } = await api.put('/settings', items);
  return data?.data || data || [];
};

// Helper: turn [{ key, value, group }] into flat map for easy editing
export const settingsToMap = (list = []) => {
  const map = {};
  for (const s of list) {
    if (s && typeof s.key === 'string') map[s.key] = s.value;
  }
  return map;
};

// Helper: turn { key: value } map back into the array format the API expects
export const mapToSettings = (map = {}, groups = {}) =>
  Object.entries(map).map(([key, value]) => {
    const group = groups[key] || key.split('.')[0] || 'general';
    return { key, value, group };
  });