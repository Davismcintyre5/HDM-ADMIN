import api from './api';

const BASE = import.meta.env.VITE_SPARK_API || 'http://localhost:5000/api/v1/admin';

function getToken() {
  return localStorage.getItem('spark_access_token');
}

export async function getUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data.data;
}

export async function getUser(userId) {
  const res = await api.get(`/users/${userId}`);
  return res.data.data;
}

export async function banUser(userId, data) {
  const res = await fetch(`${BASE}/users/${userId}/ban`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Ban failed');
  return json;
}

export async function unbanUser(userId, data) {
  const res = await fetch(`${BASE}/users/${userId}/unban`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Unban failed');
  return json;
}

export async function forceLogout(userId) {
  const res = await fetch(`${BASE}/users/${userId}/force-logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Force logout failed');
  return json;
}

export async function deleteUserPermanently(userId) {
  const res = await fetch(`${BASE}/users/${userId}/permanent`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Delete failed');
  return json;
}