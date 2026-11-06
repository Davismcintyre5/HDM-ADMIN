// src/services/talanta/images.js
import api from './api';

export const IMAGE_CATEGORIES = ['hero', 'stadium', 'hospitality', 'logo'];

// Admin: get signed upload params for Cloudinary
export const getSignature = async (category) => {
  const { data } = await api.post('/images/signature', { category });
  return data?.data || data;
};

// Admin: upload the file directly to Cloudinary using the signed params
export const uploadToCloudinary = async (file, signature) => {
  const {
    cloudName,
    apiKey,
    timestamp,
    signature: sig,
    folder,
    uploadPreset,
  } = signature;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', sig);
  if (folder) form.append('folder', folder);
  if (uploadPreset) form.append('upload_preset', uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Cloudinary upload failed');
  }
  return json;
};

// Admin: save metadata after successful Cloudinary upload
export const saveImage = async (payload) => {
  const { data } = await api.post('/images', payload);
  return data?.data || data;
};

// Admin: list images (optionally by category)
export const getImages = async (category) => {
  const params = category ? { category } : undefined;
  const { data } = await api.get('/images', { params });
  const list = data?.data || data || [];
  return Array.isArray(list) ? list : [];
};

export const updateImage = async (id, payload) => {
  const { data } = await api.put(`/images/${id}`, payload);
  return data?.data || data;
};

export const deleteImage = async (id) => {
  const { data } = await api.delete(`/images/${id}`);
  return data?.data || data;
};

// Convenience: full upload workflow in one call
export const uploadImage = async (file, category, meta = {}) => {
  const sig = await getSignature(category);
  const cloud = await uploadToCloudinary(file, sig);

  const payload = {
    category,
    publicId: cloud.public_id,
    url: cloud.secure_url,
    width: cloud.width,
    height: cloud.height,
    format: cloud.format,
    bytes: cloud.bytes,
    label: meta.label || '',
    alt: meta.alt || '',
    isPrimary: !!meta.isPrimary,
    order: meta.order ?? 0,
    published: meta.published !== false,
  };

  return saveImage(payload);
};