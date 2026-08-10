import api from './api';

const BASE_URL = import.meta.env.VITE_HDMAI2_API || 'http://localhost:5000/api/admin';

export async function getJobs(params) {
  const res = await api.get('/jobs', { params });
  return res.data;
}

export async function getJobStats() {
  const res = await api.get('/jobs/stats');
  return res.data;
}

export async function cancelJob(id) {
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
}

export async function uploadDataset(formData, token) {
  const res = await fetch(`${BASE_URL}/upload-dataset`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

export async function startTraining(data, token) {
  const res = await fetch(`${BASE_URL}/jobs/train`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}