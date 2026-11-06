// src/pages/talanta/Images.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  HiPlus,
  HiTrash,
  HiStar,
  HiPencil,
  HiEye,
  HiEyeOff,
  HiRefresh,
  HiPhotograph,
} from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Input from '../../components/talanta/ui/Input';
import Toggle from '../../components/talanta/ui/Toggle';
import Modal from '../../components/talanta/ui/Modal';
import ConfirmDialog from '../../components/talanta/ui/ConfirmDialog';
import Spinner from '../../components/talanta/ui/Spinner';
import { useToast } from '../../context/talanta/ToastContext';
import {
  IMAGE_CATEGORIES,
  getImages,
  uploadImage,
  updateImage,
  deleteImage,
} from '../../services/talanta/images';

const CATEGORY_TABS = [
  { key: 'hero', label: 'Hero', primarySingle: true },
  { key: 'stadium', label: 'Stadium', primarySingle: false },
  { key: 'hospitality', label: 'Hospitality', primarySingle: false },
  { key: 'logo', label: 'Logo', primarySingle: true },
];

const HOSPITALITY_LABELS = ['Skybox', 'Platinum', 'Gold'];

const CATEGORY_META = {
  hero: { primarySingle: true, hint: 'Homepage hero background (1 primary)' },
  stadium: { primarySingle: false, hint: 'Stadium gallery (multiple)' },
  hospitality: { primarySingle: false, hint: 'Match a package via label — Skybox / Platinum / Gold' },
  logo: { primarySingle: true, hint: 'Brand logo used in Header, Footer, ticket SVG (1 primary)' },
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function Images() {
  const toast = useToast();

  const [tab, setTab] = useState('hero');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    label: '',
    alt: '',
    isPrimary: false,
    order: 0,
    file: null,
  });

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', alt: '', order: 0 });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getImages(tab);
      setItems(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load images');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  useEffect(() => { load(); }, [load]);

  const openUpload = () => {
    setUploadForm({
      label: tab === 'hospitality' ? HOSPITALITY_LABELS[0] : '',
      alt: '',
      isPrimary: false,
      order: items.length,
      file: null,
    });
    setUploadOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP or GIF allowed');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Max file size is 8 MB');
      return;
    }
    setUploadForm((prev) => ({ ...prev, file }));
  };

  const doUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select an image');
      return;
    }
    setUploading(true);
    try {
      await uploadImage(uploadForm.file, tab, {
        label: uploadForm.label.trim(),
        alt: uploadForm.alt.trim(),
        isPrimary: uploadForm.isPrimary,
        order: Number(uploadForm.order),
        published: true,
      });
      toast.success('Image uploaded');
      setUploadOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const quickTogglePrimary = async (row) => {
    const id = row._id || row.id;
    setBusyId(id);
    try {
      await updateImage(id, { isPrimary: !row.isPrimary });
      toast.success(row.isPrimary ? 'Primary removed' : 'Set as primary');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const quickTogglePublished = async (row) => {
    const id = row._id || row.id;
    setBusyId(id);
    try {
      await updateImage(id, { published: row.published === false });
      toast.success(row.published === false ? 'Published' : 'Hidden');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setEditForm({
      label: row.label || '',
      alt: row.alt || '',
      order: row.order ?? 0,
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    const id = editTarget._id || editTarget.id;
    setBusyId(id);
    try {
      await updateImage(id, {
        label: editForm.label.trim(),
        alt: editForm.alt.trim(),
        order: Number(editForm.order),
      });
      toast.success('Image updated');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    setBusyId(id);
    try {
      await deleteImage(id);
      toast.success('Image deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  const meta = CATEGORY_META[tab] || { primarySingle: false, hint: '' };
  const activeTab = CATEGORY_TABS.find((t) => t.key === tab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Images</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Cloudinary uploads · {meta.hint}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openUpload}>
            Upload
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-color)] overflow-x-auto">
        {CATEGORY_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-sky-600 text-sky-700 dark:text-sky-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && !items.length ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <HiPhotograph className="w-10 h-10 text-[var(--text-muted)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No {activeTab?.label.toLowerCase()} images yet
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Upload your first image to display it on the public site.
            </p>
            <Button size="sm" icon={<HiPlus className="w-4 h-4" />} onClick={openUpload}>
              Upload image
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((img) => {
            const id = img._id || img.id;
            const busy = busyId === id;
            return (
              <Card key={id} padding={false} className="overflow-hidden">
                <div className="relative group">
                  <img
                    src={img.url}
                    alt={img.alt || img.label || ''}
                    className="w-full h-48 object-cover bg-[var(--bg-secondary)]"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {img.isPrimary && (
                      <Badge variant="success" dot>
                        Primary
                      </Badge>
                    )}
                    {img.published === false && (
                      <Badge variant="default" dot>
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {meta.primarySingle && (
                      <button
                        type="button"
                        onClick={() => quickTogglePrimary(img)}
                        disabled={busy}
                        title={img.isPrimary ? 'Unset primary' : 'Set as primary'}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                      >
                        <HiStar
                          className={`w-4 h-4 ${img.isPrimary ? 'fill-yellow-400 text-yellow-400' : ''}`}
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => quickTogglePublished(img)}
                      disabled={busy}
                      title={img.published === false ? 'Publish' : 'Hide'}
                      className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                    >
                      {img.published === false ? (
                        <HiEye className="w-4 h-4" />
                      ) : (
                        <HiEyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {img.label || '—'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {img.width && img.height ? `${img.width}×${img.height}` : ''}
                      {img.format ? ` · ${img.format.toUpperCase()}` : ''}
                      {img.bytes ? ` · ${Math.round(img.bytes / 1024)} KB` : ''}
                    </p>
                  </div>

                  {img.alt && (
                    <p className="text-xs text-[var(--text-muted)] italic line-clamp-2">
                      {img.alt}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-muted)]">
                      order {img.order ?? 0}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(img)}
                        disabled={busy}
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(img)}
                        disabled={busy}
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      <Modal
        open={uploadOpen}
        onClose={() => !uploading && setUploadOpen(false)}
        title={`Upload ${activeTab?.label} image`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={doUpload} loading={uploading}>
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              File *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-600 file:text-white file:text-sm file:font-medium hover:file:bg-sky-700"
            />
            {uploadForm.file && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {uploadForm.file.name} · {Math.round(uploadForm.file.size / 1024)} KB
              </p>
            )}
          </div>

          {tab === 'hospitality' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Package label
              </label>
              <select
                value={uploadForm.label}
                onChange={(e) =>
                  setUploadForm((prev) => ({ ...prev, label: e.target.value }))
                }
                disabled={uploading}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
              >
                {HOSPITALITY_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab !== 'hospitality' && (
            <Input
              label="Label"
              value={uploadForm.label}
              onChange={(e) =>
                setUploadForm((prev) => ({ ...prev, label: e.target.value }))
              }
              placeholder="Optional caption"
              disabled={uploading}
            />
          )}

          <Input
            label="Alt text"
            value={uploadForm.alt}
            onChange={(e) =>
              setUploadForm((prev) => ({ ...prev, alt: e.target.value }))
            }
            placeholder="Describe the image for accessibility"
            disabled={uploading}
          />

          <Input
            label="Order"
            type="number"
            value={uploadForm.order}
            onChange={(e) =>
              setUploadForm((prev) => ({ ...prev, order: e.target.value }))
            }
            disabled={uploading}
          />

          {meta.primarySingle && (
            <Toggle
              label="Set as primary"
              description="Only one primary per category is shown on the public site"
              checked={uploadForm.isPrimary}
              onChange={(v) =>
                setUploadForm((prev) => ({ ...prev, isPrimary: v }))
              }
            />
          )}
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit image"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              loading={busyId === (editTarget?._id || editTarget?.id)}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Label"
            value={editForm.label}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, label: e.target.value }))
            }
          />
          <Input
            label="Alt text"
            value={editForm.alt}
            onChange={(e) => setEditForm((p) => ({ ...p, alt: e.target.value }))}
          />
          <Input
            label="Order"
            type="number"
            value={editForm.order}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, order: e.target.value }))
            }
          />
          <p className="text-xs text-[var(--text-muted)]">
            publicId cannot be changed. Use the eye icon on the card to
            publish / hide, and star to set primary.
          </p>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete image"
        message={`Delete "${deleteTarget?.label || deleteTarget?.publicId || 'image'}"? This removes the Cloudinary asset AND the database record.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busyId === (deleteTarget?._id || deleteTarget?.id)}
      />
    </div>
  );
}