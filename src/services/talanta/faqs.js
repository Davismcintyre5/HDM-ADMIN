// src/services/talanta/faqs.js
import api from './api';

export const getFaqs = async () => {
  const { data } = await api.get('/faqs');
  const list = data?.data || data || [];
  return Array.isArray(list)
    ? [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];
};

export const createFaq = async (payload) => {
  const { data } = await api.post('/faqs', payload);
  return data?.data || data;
};

export const updateFaq = async (id, payload) => {
  const { data } = await api.put(`/faqs/${id}`, payload);
  return data?.data || data;
};

export const deleteFaq = async (id) => {
  const { data } = await api.delete(`/faqs/${id}`);
  return data?.data || data;
};