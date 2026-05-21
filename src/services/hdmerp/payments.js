import api from './api';

export async function getPaymentConfig() { const res = await api.get('/payments'); return res.data.data; }
export async function updatePaymentConfig(data) { const res = await api.put('/payments', data); return res.data.data; }