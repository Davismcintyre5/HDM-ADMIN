import api from './api';

export async function getSubjectsForCourse(courseId) {
  const res = await api.get(`/subjects/course/${courseId}`);
  return res.data;
}

export async function createSubject(data) {
  const res = await api.post('/subjects', data);
  return res.data;
}

export async function updateSubject(id, data) {
  const res = await api.patch(`/subjects/${id}`, data);
  return res.data;
}

export async function reorderSubjects(items) {
  const res = await api.patch('/subjects/reorder', { items });
  return res.data;
}

export async function deleteSubject(id) {
  const res = await api.delete(`/subjects/${id}`);
  return res.data;
}