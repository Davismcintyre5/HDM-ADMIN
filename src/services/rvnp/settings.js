import api from './api';

export async function getGeneralSettings() {
  const res = await api.get('/settings/general');
  return res.data;
}

export async function updateGeneralSettings(data) {
  const res = await api.put('/settings/general', data);
  return res.data;
}

export async function getSetting(key) {
  const res = await api.get(`/settings/${key}`);
  return res.data;
}

export async function deleteSetting(key) {
  const res = await api.delete(`/settings/${key}`);
  return res.data;
}

// Campuses
export async function getCampuses() {
  const res = await api.get('/settings/campuses');
  return res.data;
}

export async function getCampus(id) {
  const res = await api.get(`/settings/campuses/${id}`);
  return res.data;
}

export async function createCampus(data) {
  const res = await api.post('/settings/campuses', data);
  return res.data;
}

export async function updateCampus(id, data) {
  const res = await api.put(`/settings/campuses/${id}`, data);
  return res.data;
}

export async function deleteCampus(id) {
  const res = await api.delete(`/settings/campuses/${id}`);
  return res.data;
}

// Departments
export async function getDepartments() {
  const res = await api.get('/settings/departments');
  return res.data;
}

export async function getDepartment(id) {
  const res = await api.get(`/settings/departments/${id}`);
  return res.data;
}

export async function createDepartment(data) {
  const res = await api.post('/settings/departments', data);
  return res.data;
}

export async function updateDepartment(id, data) {
  const res = await api.put(`/settings/departments/${id}`, data);
  return res.data;
}

export async function deleteDepartment(id) {
  const res = await api.delete(`/settings/departments/${id}`);
  return res.data;
}