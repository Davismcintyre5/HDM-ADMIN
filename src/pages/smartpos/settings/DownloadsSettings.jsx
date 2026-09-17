import { useState, useEffect } from 'react';
import {
  getDownloads,
  addDownload,
  updateDownload,
  toggleDownload,
  deleteDownload
} from '../../../services/smartpos/settings';
import Card from '../../../components/smartpos/ui/Card';
import Table from '../../../components/smartpos/ui/Table';
import Badge from '../../../components/smartpos/ui/Badge';
import Button from '../../../components/smartpos/ui/Button';
import Input from '../../../components/smartpos/ui/Input';
import Select from '../../../components/smartpos/ui/Select';
import Modal from '../../../components/smartpos/ui/Modal';
import ConfirmDialog from '../../../components/smartpos/ui/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const TYPES = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' }
];

const ARCH = [
  { value: 'x64', label: 'x64' },
  { value: 'arm64', label: 'arm64' },
  { value: 'universal', label: 'universal' },
  { value: 'other', label: 'other' }
];

const typeVariant = {
  windows: 'info',
  macos: 'default',
  linux: 'warning',
  android: 'success',
  ios: 'default'
};

const EMPTY = {
  name: '',
  type: 'windows',
  version: '',
  arch: 'x64',
  link: '',
  size: '',
  checksum: '',
  minOS: '',
  releaseNotes: '',
  enabled: true
};

export default function DownloadsSettings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterType, setFilterType] = useState('');

  const [modal, setModal] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);
    getDownloads()
      .then((res) => setItems(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const visible = filterType ? items.filter((i) => i.type === filterType) : items;

  const openCreate = () => {
    setForm(EMPTY);
    setModal({ open: true, id: null });
  };

  const openEdit = (row) => {
    setForm({
      name: row.name || '',
      type: row.type || 'windows',
      version: row.version || '',
      arch: row.arch || 'x64',
      link: row.link || '',
      size: row.size ? Math.round(row.size / 1024 / 1024) : '',
      checksum: row.checksum || '',
      minOS: row.minOS || '',
      releaseNotes: row.releaseNotes || '',
      enabled: row.enabled !== false
    });
    setModal({ open: true, id: row.id });
  };

  const handleSave = async () => {
    if (!form.name || !form.type || !form.version || !form.link) {
      return alert('Name, type, version, and link are required');
    }

    const payload = {
      ...form,
      size: form.size ? Number(form.size) * 1024 * 1024 : null
    };

    setActionLoading(true);
    try {
      if (modal.id) await updateDownload(modal.id, payload);
      else await addDownload(payload);
      setModal({ open: false, id: null });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleToggle = async (id) => {
    setActionLoading(true);
    try {
      await toggleDownload(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteDownload(confirmDelete.id);
      setConfirmDelete({ open: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    const mb = bytes / 1024 / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium text-[var(--text-primary)]">{row.name}</p>
          {row.minOS && (
            <p className="text-xs text-[var(--text-muted)]">Min: {row.minOS}</p>
          )}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Platform',
      render: (row) => (
        <Badge variant={typeVariant[row.type] || 'default'}>{row.type}</Badge>
      )
    },
    {
      key: 'version',
      label: 'Version',
      render: (row) => <span className="text-sm font-mono">{row.version}</span>
    },
    {
      key: 'arch',
      label: 'Arch',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">{row.arch}</span>
      )
    },
    {
      key: 'size',
      label: 'Size',
      render: (row) => <span className="text-xs">{formatSize(row.size)}</span>
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.enabled ? 'success' : 'default'}>
          {row.enabled ? 'Visible' : 'Hidden'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            <HiPencil className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={row.enabled ? 'warning' : 'success'}
            onClick={() => handleToggle(row.id)}
          >
            {row.enabled ? 'Hide' : 'Show'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirmDelete({ open: true, id: row.id, name: row.name })}
          >
            <HiTrash className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Downloads</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Apps shown on the public downloads page.
            </p>
          </div>
          <Button onClick={openCreate} size="sm">
            <HiPlus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[{ value: '', label: 'All' }, ...TYPES].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === f.value
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={visible}
          loading={loading}
          emptyMessage="No downloads yet."
        />
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, id: null })}
        title={modal.id ? 'Edit Download' : 'Add Download'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="SmartPOS for Windows"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Platform"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={TYPES}
            />
            <Select
              label="Architecture"
              value={form.arch}
              onChange={(e) => setForm({ ...form, arch: e.target.value })}
              options={ARCH}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Version"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="1.4.2"
            />
            <Input
              label="Size (MB, optional)"
              type="number"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
          </div>

          <Input
            label="Download link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="https://..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min OS (optional)"
              value={form.minOS}
              onChange={(e) => setForm({ ...form, minOS: e.target.value })}
              placeholder="Windows 10"
            />
            <Input
              label="SHA-256 checksum (optional)"
              value={form.checksum}
              onChange={(e) => setForm({ ...form, checksum: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Release notes (optional)
            </label>
            <textarea
              rows={3}
              value={form.releaseNotes}
              onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })}
              placeholder="Bug fixes, new features..."
              className="w-full px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-primary)]">Visible on public site</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, id: null })}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={actionLoading}>
              {modal.id ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Download"
        message={`Permanently delete "${confirmDelete.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}