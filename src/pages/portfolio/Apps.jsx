import { useEffect, useState } from 'react';
import {
  getApps,
  createApp,
  updateApp,
  deleteApp,
} from '../../services/portfolio/apps';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import SearchBar from '../../components/portfolio/ui/SearchBar';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import { useToast } from '../../context/portfolio/ToastContext';
import { HiPencil, HiTrash, HiStar, HiPlus } from 'react-icons/hi';

const CATEGORIES = [
  'Web Apps',
  'Mobile',
  'Desktop',
  'APIs',
  'Games',
  'Open Source',
  'Security',
  'Other',
];

const EMPTY_FORM = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  category: 'Web Apps',
  technologies: [],
  icon: '',
  screenshots: [],
  urls: { live: '', github: '', playstore: '', appstore: '' },
  features: [],
  featured: false,
  rating: 0,
  version: '1.0.0',
  isActive: true,
};

export default function Apps() {
  const toast = useToast();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, app: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchApps = () => {
    setLoading(true);
    getApps()
      .then((res) => setApps(res.data || res || []))
      .catch((err) => toast.error(err.message || 'Failed to load apps'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = apps.filter(
    (a) =>
      !search.trim() ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
  );

  const autoSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, app: null });
  };

  const openEdit = (app) => {
    setForm({
      ...EMPTY_FORM,
      ...app,
      urls: { ...EMPTY_FORM.urls, ...(app.urls || {}) },
    });
    setModal({ open: true, app });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug?.trim() || autoSlug(form.name),
      };
      if (modal.app) await updateApp(modal.app._id, payload);
      else await createApp(payload);
      toast.success(modal.app ? 'App updated' : 'App created');
      setModal({ open: false, app: null });
      fetchApps();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteApp(confirmDelete.id);
      toast.success('App deleted');
      setConfirmDelete({ open: false, id: null });
      fetchApps();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.icon && (
            <img
              src={row.icon}
              alt=""
              className="w-6 h-6 rounded"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <span className="font-medium text-[var(--text-primary)]">
            {row.name}
          </span>
          {row.featured && <HiStar className="w-4 h-4 text-yellow-500" />}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <Badge variant="green">{row.category || '—'}</Badge>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">
          {row.rating || 0}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) =>
        row.isActive !== false ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="default">Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            <HiPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirmDelete({ open: true, id: row._id })}
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Apps
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {apps.length} app{apps.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <div className="flex-1 sm:w-64">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search apps..."
            />
          </div>
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
            New App
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage="No apps yet."
          />
        </div>
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, app: null })}
        title={modal.app ? 'Edit App' : 'New App'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
            <Input
              label="Slug"
              hint="Auto-generated from name"
              value={form.slug}
              onChange={(e) =>
                setForm((p) => ({ ...p, slug: e.target.value }))
              }
              placeholder={autoSlug(form.name)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Short Description"
            value={form.shortDescription}
            onChange={(e) =>
              setForm((p) => ({ ...p, shortDescription: e.target.value }))
            }
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Full Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm"
            />
          </div>

          <Input
            label="Technologies (comma separated)"
            value={(form.technologies || []).join(', ')}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                technologies: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />

          <Input
            label="Icon URL"
            value={form.icon}
            onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Live URL"
              value={form.urls?.live || ''}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  urls: { ...p.urls, live: e.target.value },
                }))
              }
            />
            <Input
              label="GitHub URL"
              value={form.urls?.github || ''}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  urls: { ...p.urls, github: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Play Store URL"
              value={form.urls?.playstore || ''}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  urls: { ...p.urls, playstore: e.target.value },
                }))
              }
            />
            <Input
              label="App Store URL"
              value={form.urls?.appstore || ''}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  urls: { ...p.urls, appstore: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Version"
              value={form.version}
              onChange={(e) =>
                setForm((p) => ({ ...p, version: e.target.value }))
              }
              placeholder="1.0.0"
            />
            <Input
              label="Rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) =>
                setForm((p) => ({ ...p, rating: Number(e.target.value) }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Toggle
              label="Featured"
              checked={form.featured}
              onChange={(v) => setForm((p) => ({ ...p, featured: v }))}
            />
            <Toggle
              label="Active"
              checked={form.isActive !== false}
              onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setModal({ open: false, app: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete App"
        message="Permanently delete this app?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}