// services/tvetgrid/health.js
import api from './api';

export const getDetailedHealth = () =>
  api.get('/health/detailed').then((r) => r.data);

export const getSimpleHealth = () =>
  api.get('/health').then((r) => r.data);