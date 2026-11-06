// src/services/talanta/match.js
import api from './api';

export const getMatch = async () => {
  const { data } = await api.get('/match');
  return data?.data || data;
};

export const updateMatch = async (patch) => {
  const { data } = await api.put('/match', patch);
  return data?.data || data;
};