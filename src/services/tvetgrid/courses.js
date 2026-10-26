import api from './api';

export async function getCourses(params) {
  const res = await api.get('/courses', { params });
  return res.data;
}

export async function getCourse(id) {
  const res = await api.get(`/courses/${id}`);
  return res.data;
}

export async function createCourse(data) {
  const res = await api.post('/courses', data);
  return res.data;
}

export async function updateCourse(id, data) {
  const res = await api.patch(`/courses/${id}`, data);
  return res.data;
}

export async function deleteCourse(id) {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
}