import { useEffect, useState } from 'react';
import { getPhotos, uploadPhoto, deletePhoto } from '../../services/portfolio/photos';
import Card from '../../components/portfolio/ui/Card';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import { HiTrash, HiUpload, HiPencil } from 'react-icons/hi';

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, photo: null });
  const [form, setForm] = useState({ title: '', category: '', photo: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchPhotos = () => {
    setLoading(true);
    getPhotos()
      .then(res => setPhotos(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPhotos(); }, []);

  const getImageUrl = (photo) => {
    if (!photo) return '';
    const path = photo.path || photo.url || photo.imageUrl || photo.photo || '';
    if (path.startsWith('http')) return path;
    return path;
  };

  const openAdd = () => {
    setForm({ title: '', category: '', photo: null });
    setError('');
    setModal({ open: true, photo: null });
  };

  const openEdit = (photo) => {
    setForm({ title: photo.title || '', category: photo.category || '', photo: null });
    setError('');
    setModal({ open: true, photo });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB');
      return;
    }
    setForm(p => ({ ...p, photo: file }));
    setError('');
  };

  const validateForm = () => {
    if (!form.title.trim()) { setError('Title is required'); return false; }
    if (!modal.photo && !form.photo) { setError('Photo is required'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('category', form.category || '');
    if (form.photo) formData.append('photo', form.photo);

    try {
      await uploadPhoto(formData);
      setModal({ open: false, photo: null });
      fetchPhotos();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchPhotos();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Photos</h1>
          <p className="text-sm text-[var(--text-muted)]">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openAdd}><HiUpload className="w-4 h-4 mr-1" /> Add Photo</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No photos yet</h3>
          <p className="text-[var(--text-muted)]">Upload your first photo to the gallery</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(p => (
            <Card key={p._id} padding={false} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={getImageUrl(p)}
                  alt={p.title || 'Photo'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23ddd"><rect width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16">No Image</text></svg>';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    title="Edit photo"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ open: true, id: p._id })}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    title="Delete photo"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.title || 'Untitled'}</p>
                {p.category && <p className="text-xs text-[var(--text-muted)]">{p.category}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, photo: null })}
        title={modal.photo ? 'Edit Photo' : 'Add Photo'}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>
          )}

          <Input label="Title *" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Photo title" disabled={saving} />
          <Input label="Category" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Events, Office, Team" disabled={saving} />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Photo {!modal.photo && '*'}
            </label>
            <input type="file" accept="image/*" onChange={handleFileChange}
              className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 dark:file:bg-green-900/20 file:text-green-700 dark:file:text-green-400"
              disabled={saving} />
            <p className="text-xs text-[var(--text-muted)] mt-1">Max 10MB. Leave empty to keep current photo.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, photo: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {saving ? 'Saving...' : modal.photo ? 'Update' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Photo"
        message="Permanently delete this photo?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}