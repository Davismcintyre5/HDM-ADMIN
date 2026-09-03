import api from './api';

export async function getPosts(params) {
  const res = await api.get('/moderation/posts', { params });
  return res.data;
}

export async function getReels(params) {
  const res = await api.get('/moderation/reels', { params });
  return res.data;
}

export async function getComments(params) {
  const res = await api.get('/moderation/comments', { params });
  return res.data;
}

export async function deletePost(id) {
  const res = await api.delete(`/moderation/posts/${id}`);
  return res.data;
}

export async function deleteReel(id) {
  const res = await api.delete(`/moderation/reels/${id}`);
  return res.data;
}

export async function deleteComment(id) {
  const res = await api.delete(`/moderation/comments/${id}`);
  return res.data;
}

export async function restorePost(id) {
  const res = await api.put(`/moderation/posts/${id}/restore`);
  return res.data;
}

export async function restoreReel(id) {
  const res = await api.put(`/moderation/reels/${id}/restore`);
  return res.data;
}

export async function restoreComment(id) {
  const res = await api.put(`/moderation/comments/${id}/restore`);
  return res.data;
}