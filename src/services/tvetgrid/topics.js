import api from './api';

export async function getTopicsForCourse(courseId) {
  const res = await api.get(`/topics/course/${courseId}`);
  return res.data;
}

export async function createTopic(data) {
  const res = await api.post('/topics', data);
  return res.data;
}

export async function updateTopic(id, data) {
  const res = await api.patch(`/topics/${id}`, data);
  return res.data;
}

export async function reorderTopics(items) {
  const res = await api.patch('/topics/reorder', { items });
  return res.data;
}

export async function deleteTopic(id) {
  const res = await api.delete(`/topics/${id}`);
  return res.data;
}