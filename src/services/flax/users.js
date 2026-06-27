import api from './api';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_FLAX_API || 'http://localhost:5000/api/admin';
// Transactions are at /api/ not /api/admin/
const TX_BASE = BASE_URL.replace('/api/admin', '/api');

export async function getUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function suspendUser(id) {
  const res = await api.put(`/users/${id}/suspend`);
  return res.data;
}

export async function activateUser(id) {
  const res = await api.put(`/users/${id}/activate`);
  return res.data;
}

export async function resetUserPin(id) {
  const res = await api.put(`/users/${id}/reset-pin`);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function getUserTransactions(phoneNumber, params = {}) {
  const token = localStorage.getItem('flax_token');
  const res = await axios.get(`${TX_BASE}/transactions/${phoneNumber}`, {
    params,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.data;
}