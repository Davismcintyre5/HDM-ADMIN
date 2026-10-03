import { useEffect, useState } from 'react';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiDownload,
  HiExternalLink,
  HiDesktopComputer,
  HiDeviceMobile,
  HiX,
} from 'react-icons/hi';
import {
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaPowerOff,
} from 'react-icons/fa';
import Card from '../../../components/pharmasys/ui/Card';
import Button from '../../../components/pharmasys/ui/Button';
import Input from '../../../components/pharmasys/ui/Input';
import Select from '../../../components/pharmasys/ui/Select';
import Spinner from '../../../components/pharmasys/ui/Spinner';
import Toggle from '../../../components/pharmasys/ui/Toggle';
import Modal from '../../../components/pharmasys/ui/Modal';
import { useToast } from '../../../context/pharmasys/ToastContext';
import {
  getDownloads,
  createDownload,
  updateDownload,
  toggleDownload,
  removeDownload,
} from '../../../services/pharmasys/downloads';

const PLATFORMS = [
  { value: 'windows', label: 'Windows', Icon: FaWindows },
  { value: 'macos', label: 'macOS', Icon: FaApple },
  { value: 'linux', label: 'Linux', Icon: FaLinux },
  { value: 'android', label: 'Android', Icon: FaAndroid },
  { value: 'ios', label: 'iOS', Icon: HiDeviceMobile },
];

const ARCHS = ['x64', 'arm64', 'x86', 'universal'];

const EMPTY_FORM = {
  name: '',
  type: 'windows',
  version: '',
  arch: 'x64',
  link: '',
  size: '',
  checksum: '',
  minOS: '',
  releaseNotes: '',
  enabled: true,
};

export default function DownloadsTab() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getDownloads()
      .then((res) => {
        const list = res?.data || res || [];
        setItems(
          Array.isArray(list)
            ? [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            : []
        );
      })
      .catch((err) => toast.error(err.message || 'Failed to load downloads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      type: item.type || 'windows',
      version: item.version || '',
      arch: item.arch || 'x64',
      link: item.link || '',
      size: item.size || '',
      checksum: item.checksum || '',
      minOS: item.minOS || '',
      releaseNotes: item.releaseNotes || '',
      enabled: item.enabled !== false,
    });
    setModalOpen(true);
  };

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.version.trim() || !form.link.trim()) {
      toast.error('Name, version, and URL are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateDownload(editing.id || editing._id, form);
        toast.success('Download updated');
      } else {
        await createDownload(form);
        toast.success('Download added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    const id = item.id || item._id;
    try {
      await toggleDownload(id);
      load();
      toast.success(`Download ${item.enabled ? 'disabled' : 'enabled'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to toggle');
    }
  };

  const handleDelete = async (item) => {
    const id = item.id || item._id;
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await removeDownload(id);
      load();
      toast.success('Download deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Downloads
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Desktop and mobile app builds available to your users.
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={openAdd}>
          Add download
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HiDownload className="w-8 h-8 text-[var(--text-muted)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No downloads yet
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Add your first build to make it available to users.
            </p>
            <Button
              size="sm"
              icon={<HiPlus className="w-4 h-4" />}
              onClick={openAdd}
            >
              Add download
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const id = item.id || item._id;
            const platform = PLATFORMS.find((p) => p.value === item.type);
            const Icon = platform?.Icon || HiDesktopComputer;
            return (
              <Card key={id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {item.name}
                        </p>
                        {item.enabled ? (
                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600">
                            Enabled
                          </span>
                        ) : (
                          <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        v{item.version}
                        {item.arch ? ` · ${item.arch}` : ''}
                        {item.size ? ` · ${item.size}` : ''}
                        {platform ? ` · ${platform.label}` : ''}
                      </p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 truncate text-xs text-rose-600 hover:underline"
                      >
                        {item.link}
                        <HiExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleToggle(item)}
                      className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                      type="button"
                      title={item.enabled ? 'Disable' : 'Enable'}
                    >
                      <FaPowerOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                      type="button"
                      title="Edit"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-red-600"
                      type="button"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit download' : 'Add download'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save changes' : 'Add download'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => patch('name', e.target.value)}
            placeholder="PharmaSys for Windows"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Platform"
              value={form.type}
              onChange={(e) => patch('type', e.target.value)}
              options={PLATFORMS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
            />
            <Select
              label="Architecture"
              value={form.arch}
              onChange={(e) => patch('arch', e.target.value)}
              options={ARCHS.map((a) => ({ value: a, label: a }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Version"
              value={form.version}
              onChange={(e) => patch('version', e.target.value)}
              placeholder="1.2.0"
            />
            <Input
              label="Size"
              value={form.size}
              onChange={(e) => patch('size', e.target.value)}
              placeholder="45 MB"
            />
          </div>

          <Input
            label="URL"
            type="url"
            value={form.link}
            onChange={(e) => patch('link', e.target.value)}
            placeholder="https://downloads.example.com/pharmasys-1.2.0.exe"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum OS"
              value={form.minOS}
              onChange={(e) => patch('minOS', e.target.value)}
              placeholder="Windows 10+"
            />
            <Input
              label="Checksum (SHA-256)"
              value={form.checksum}
              onChange={(e) => patch('checksum', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
              Release notes
            </label>
            <textarea
              rows={3}
              value={form.releaseNotes}
              onChange={(e) => patch('releaseNotes', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="What's new in this version..."
            />
          </div>

          <Toggle
            label="Make this download available immediately"
            checked={form.enabled !== false}
            onChange={(v) => patch('enabled', v)}
          />
        </div>
      </Modal>
    </div>
  );
}