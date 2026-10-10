import { useEffect, useState } from 'react';
import {
  getPhotos,
  uploadPhoto,
  deletePhoto,
} from '../../services/portfolio/photos';
import Card from '../../components/portfolio/ui/Card';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import SearchBar from '../../components/portfolio/ui/SearchBar';
import { useToast } from '../../context/portfolio/ToastContext';
import { HiTrash, HiUpload, HiPlus, HiPhotograph } from 'react-icons/hi';

export default function Photos() {
  const toast = useToast();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, photo: null });
  const [form, setForm] = useState({ title: '', category: '', photo: null });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });
  const [lightbox, setLightbox] = useState({ open: false, url: '' });

  const fetchPhotos = () => {
    setLoading(true);
    getPhotos()
      .then((res) => setPhotos(res.data || res || []))
      .catch((err) => toast.error(err.message || 'Failed to load photos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = Array.from(
    new Set(photos.map((p) => p.category).filter(Boolean))
  ).sort();

  const filtered = photos.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getImageUrl = (photo) => photo?.url || photo?.path || '';

  const openAdd = () => {
    setForm({ title: '', category: '', photo: null });
    setModal({ open: true, photo: null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB');
      return;
    }
    setForm((p) => ({ ...p, photo: file }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.photo) {
      toast.error('Please select a photo');
      return;
    }
    setSaving(true);
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('category', form.category || '');
    formData.append('photo', form.photo);
    try {
      await uploadPhoto(formData);
      toast.success('Photo uploaded');
      setModal({ open: false, photo: null });
      fetchPhotos();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto(confirmDelete.id);
      toast.success('Photo deleted');
      setConfirmDelete({ open: false, id: null });
      fetchPhotos();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Photos
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<HiUpload className="w-4 h-4" />} onClick={openAdd}>
          Upload Photo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search photos..."
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <HiPhotograph className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {photos.length === 0 ? 'No photos yet' : 'No matches'}
          </h3>
          <p className="text-[var(--text-muted)] text-sm mb-4">
            {photos.length === 0
              ? 'Upload your first photo to the gallery'
              : 'Try a different search or filter'}
          </p>
          {photos.length === 0 && (
            <Button icon={<HiPlus className="w-4 h-4" />} onClick={openAdd}>
              Upload Photo
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Card
              key={p._id}
              padding={false}
              className="overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={getImageUrl(p)}
                  alt={p.title || 'Photo'}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() =>
                    setLightbox({ open: true, url: getImageUrl(p) })
                  }
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23ddd"><rect width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16">No Image</text></svg>';
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setConfirmDelete({ open: true, id: p._id })}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    type="button"
                    title="Delete photo"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {p.title || 'Untitled'}
                </p>
                {p.category && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {p.category}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, photo: null })}
        title="Upload Photo"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModal({ open: false, photo: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Photo title"
            disabled={saving}
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
            placeholder="e.g., Events, Office, Team"
            disabled={saving}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Photo *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 dark:file:bg-green-900/20 file:text-green-700 dark:file:text-green-400"
              disabled={saving}
            />
            {form.photo && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Selected: {form.photo.name}
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1">
              JPEG, PNG, GIF, or WEBP. Max 10MB.
            </p>
          </div>
        </div>
      </Modal>

      {/* Lightbox */}
      <Modal
        open={lightbox.open}
        onClose={() => setLightbox({ open: false, url: '' })}
        title="Preview"
        size="xl"
      >
        {lightbox.url && (
          <img
            src={lightbox.url}
            alt="Preview"
            className="max-w-full max-h-[75vh] rounded-lg object-contain mx-auto"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Photo"
        message="Permanently delete this photo? It will also be removed from Cloudinary."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}