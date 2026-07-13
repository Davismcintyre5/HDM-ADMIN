import api from './api';

export async function getLanding() {
  const res = await api.get('/landing');
  return res.data;
}

export async function getLandingSection(section) {
  const res = await api.get(`/landing/${section}`);
  return res.data;
}

export async function updateLandingSection(section, data) {
  const res = await api.put(`/landing/${section}`, data);
  return res.data;
}