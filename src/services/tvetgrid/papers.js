import api from './api';

export async function getPapers(params) {
  const res = await api.get('/papers', { params });
  return res.data;
}

export async function getPaper(id) {
  const res = await api.get(`/papers/${id}`);
  return res.data;
}

export async function createPaper(data) {
  const res = await api.post('/papers', data);
  return res.data;
}

export async function updatePaper(id, data) {
  const res = await api.patch(`/papers/${id}`, data);
  return res.data;
}

export async function updatePaperQuestions(id, questions) {
  const res = await api.patch(`/papers/${id}/questions`, { questions });
  return res.data;
}

export async function deletePaper(id) {
  const res = await api.delete(`/papers/${id}`);
  return res.data;
}