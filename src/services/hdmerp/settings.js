import api from './api';

export function getGeneralSettings() { return api.get('/settings/general').then(res => res.data.data); }
export function updateGeneralSettings(data) { return api.put('/settings/general', data).then(res => res.data.data); }

export function getBrandingSettings() { return api.get('/settings/branding').then(res => res.data.data); }
export function updateBrandingSettings(data) { return api.put('/settings/branding', data).then(res => res.data.data); }

export function getLandingSettings() { return api.get('/settings/landing').then(res => res.data.data); }
export function updateLandingSettings(data) { return api.put('/settings/landing', data).then(res => res.data.data); }

export function getUploadsSettings() { return api.get('/settings/uploads').then(res => res.data.data); }
export function updateUploadsSettings(data) { return api.put('/settings/uploads', data).then(res => res.data.data); }

export function getDownloadsSettings() { return api.get('/settings/downloads').then(res => res.data.data); }
export function updateDownloadsSettings(data) { return api.put('/settings/downloads', data).then(res => res.data.data); }

// Maintenance
export function getMaintenanceSettings() { return api.get('/settings/maintenance').then(res => res.data.data); }
export function updateMaintenanceSettings(data) { return api.put('/settings/maintenance', data).then(res => res.data.data); }