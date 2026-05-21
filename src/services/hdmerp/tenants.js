import api from './api';

export async function getTenants() { const res = await api.get('/tenants'); return res.data.data; }
export async function getTenant(id) { const res = await api.get(`/tenants/${id}`); return res.data.data; }
export async function suspendTenant(id) { const res = await api.put(`/tenants/${id}/suspend`); return res.data; }
export async function deleteTenant(id) { const res = await api.delete(`/tenants/${id}`); return res.data; }