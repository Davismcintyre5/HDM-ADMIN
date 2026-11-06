// src/services/talanta/notify.js
import api from './api';

export const getNotifyList = async ({ page = 1, limit = 20, confirmed, q } = {}) => {
  const params = { page, limit };
  if (confirmed !== undefined) params.confirmed = confirmed;
  if (q) params.q = q;

  const { data } = await api.get('/notify', { params });
  return {
    items: data?.data || [],
    meta: data?.meta || { page: 1, limit, total: 0, pages: 1 },
  };
};