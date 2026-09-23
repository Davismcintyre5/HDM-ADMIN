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
import Card from '../../../components/smartpos/ui/Card';
import Button from '../../../components/smartpos/ui/Button';
import Input from '../../../components/smartpos/ui/Input';
import Spinner from '../../../components/smartpos/ui/Spinner';
import Toggle from '../../../components/smartpos/ui/Toggle';
import { useToast } from '../../../context/smartpos/ToastContext';
import {
  getDownloads,
  addDownload,
  updateDownload,
  toggleDownload,
  removeDownload,
} from '../../../services/smartpos/downloads';

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
        setItems([...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
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
      name: item.name,
      type: item.type,
      version: item.version,
      arch: item.arch || 'x64',
      link: item.link,
      size: item.size || '',
      minOS: item.minOS || '',
      releaseNotes: item.releaseNotes || '',
      enabled: item.enabled !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name.trim() || !form.version.trim() || !form.link.trim()) {
      toast.error('Name, version, and URL are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateDownload(editing.id, form);
        toast.success('Download updated');
      } else {
        await addDownload(form);
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
    try {
      await toggleDownload(item.id);
      load();
      toast.success(`Download ${item.enabled ? 'disabled' : 'enabled'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to toggle');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await removeDownload(item.id);
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
            const platform = PLATFORMS.find((p) => p.value === item.type);
            const Icon = platform?.Icon || HiDesktopComputer;
            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
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
                        className="mt-1 inline-flex items-center gap-1 truncate text-xs text-blue-600 hover:underline"
                      >
                        {item.link}
                        <HiExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(item)}
                      icon={<FaPowerOff className="w-4 h-4" />}
                      aria-label={item.enabled ? 'Disable' : 'Enable'}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(item)}
                      icon={<HiPencil className="w-4 h-4" />}
                      aria-label="Edit"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item)}
                      icon={<HiTrash className="w-4 h-4" />}
                      aria-label="Delete"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !saving && setModalOpen(false)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {editing ? 'Edit download' : 'Add download'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="SmartPOS for Windows"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                      Platform
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                      Architecture
                    </label>
                    <select
                      value={form.arch}
                      onChange={(e) => setForm({ ...form, arch: e.target.value })}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ARCHS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Version"
                    value={form.version}
                    onChange={(e) =>
                      setForm({ ...form, version: e.target.value })
                    }
                    placeholder="1.2.0"
                  />
                  <Input
                    label="Size"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="45 MB"
                  />
                </div>

                <Input
                  label="URL"
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://downloads.example.com/smartpos-1.2.0.exe"
                />

                <Input
                  label="Minimum OS"
                  value={form.minOS}
                  onChange={(e) => setForm({ ...form, minOS: e.target.value })}
                  placeholder="Windows 10+"
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Release notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.releaseNotes}
                    onChange={(e) =>
                      setForm({ ...form, releaseNotes: e.target.value })
                    }
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's new in this version…"
                  />
                </div>

                <Toggle
                  label="Make this download available immediately"
                  checked={form.enabled !== false}
                  onChange={(v) => setForm({ ...form, enabled: v })}
                />
              </form>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] px-5 py-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={saving}>
                {editing ? 'Save changes' : 'Add download'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}