import api from './api';

export const getApprovals = (params) => api.get('/approvals', { params });
export const getPendingApprovals = (params) => api.get('/approvals', { params });
export const getApprovalHistory = (params) => api.get('/approvals/history', { params });
export const approveUser = (id, data) => api.put(`/approvals/${id}/approve`, data);
export const rejectUser = (id, data) => api.put(`/approvals/${id}/reject`, data);
export const confirmPayment = (id, data) => api.post(`/approvals/${id}/confirm-payment`, data);