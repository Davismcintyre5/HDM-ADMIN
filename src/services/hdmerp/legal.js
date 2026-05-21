import api from './api';

export async function getLegalDocument(type) { const res = await api.get(`/legal/${type}`); return res.data.data; }
export async function updateLegalDocument(type, data) { const res = await api.put(`/legal/${type}`, data); return res.data.data; }