import api, { normalizeError } from './api';

export async function getHealth() {
  try {
    const res = await api.get('/health', { timeout: 10000 });
    return res?.data || null;
  } catch (err) {
    const norm = normalizeError(err);
    if (norm.status === 503 && norm.payload?.status) {
      return norm.payload;
    }
    throw norm;
  }
}

export async function getDetailedHealth() {
  try {
    const res = await api.get('/health/detailed', { timeout: 20000 });
    return res?.data || null;
  } catch (err) {
    const norm = normalizeError(err);
    if (norm.status === 503 && norm.payload?.server) {
      return norm.payload;
    }
    throw norm;
  }
}