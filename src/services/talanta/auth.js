// src/services/talanta/auth.js
import api from './api';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data?.data || data;
};

export const me = async () => {
  const { data } = await api.get('/auth/me');
  return data?.data || data;
};