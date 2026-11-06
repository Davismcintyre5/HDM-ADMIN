// src/services/talanta/categories.js
import api from './api';

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  const list = data?.data || data || [];
  return Array.isArray(list)
    ? [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data?.data || data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data?.data || data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data?.data || data;
};