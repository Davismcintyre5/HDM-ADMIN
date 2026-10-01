import { useEffect, useState, useCallback } from 'react';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiDownload,
  HiExternalLink,
  HiDesktopComputer,
  HiDeviceMobile,
  HiX,
  HiRefresh,
} from 'react-icons/hi';
import {
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaPowerOff,
} from 'react-icons/fa';
import Card from '../../../components/bizhub/ui/Card';
import Button from '../../../components/bizhub/ui/Button';
import Input from '../../../components/bizhub/ui/Input';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Toggle from '../../../components/bizhub/ui/Toggle';
import {
  getDownloads,
  addDownload,
  updateDownload,
  toggleDownload,
  removeDownload,
} from '../../../services/bizhub/downloads';

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

const unwrapList = (res) => {
  const payload = res?.data?.data ?? res?.data ?? res;
  return Array.isArray(payload) ? payload : [];
};

export default function DownloadsSettings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback((silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    getDownloads()
      .then((res) => {
        const list = unwrapList(res);
        setItems(
          [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        );
      })
      .catch((err) => {
        console.error('Load downloads:', err);
        alert(err.response?.data?.message || err.message || 'Failed to load downloads');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
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
      minOS: item.minOS || '',
      releaseNotes: item.releaseNotes || '',
      enabled: item.enabled !== false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.version.trim()) return 'Version is required';
    if (!form.link.trim()) return 'URL is required';

    try {
      const u = new URL(form.link);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return 'URL must start with http:// or https://';
      }
    } catch {
      return 'URL is not valid';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError('');

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        version: form.version.trim(),
        arch: form.arch,
        link: form.link.trim(),
        size: form.size.trim(),
        minOS: form.minOS.trim(),
        releaseNotes: form.releaseNotes.trim(),
        enabled: form.enabled !== false,
      };

      if (editing) {
        await updateDownload(editing.id || editing._id, payload);
      } else {
        await addDownload(payload);
      }

      setModalOpen(false);
      load(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save';
      setFormError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    const id = item.id || item._id;
    setTogglingId(id);
    try {
      await toggleDownload(id);
      setItems((prev) =>
        prev.map((it) =>
          (it.id || it._id) === id ? { ...it, enabled: !it.enabled } : it
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to toggle');
      load(true);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" v${item.version}? This cannot be undone.`)) {
      return;
    }

    try {
      await removeDownload(item.id || item._id);
      setItems((prev) =>
        prev.filter((it) => (it.id || it._id) !== (item.id || item._id))
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Downloads</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Desktop and mobile app builds available to your users.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={loading || refreshing}
          >
            <HiRefresh className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openAdd}
          >
            <HiPlus className="w-4 h-4 mr-1" /> Add download
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HiDownload className="w-10 h-10 text-[var(--text-muted)] opacity-60" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No downloads yet
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Add your first build to make it available to users.
            </p>
            <Button size="sm" onClick={openAdd}>
              <HiPlus className="w-4 h-4 mr-1" /> Add download
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const platform = PLATFORMS.find((p) => p.value === item.type);
            const Icon = platform?.Icon || HiDesktopComputer;
            const itemId = item.id || item._id;
            const isToggling = togglingId === itemId;

            return (
              <Card key={itemId}>
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
                        {item.minOS ? ` · ${item.minOS}` : ''}
                        {platform ? ` · ${platform.label}` : ''}
                      </p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 truncate text-xs text-blue-600 hover:underline"
                      >
                        {item.link.length > 60 ? `${item.link.slice(0, 60)}…` : item.link}
                        <HiExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      disabled={isToggling}
                      className="rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                      title={item.enabled ? 'Disable' : 'Enable'}
                    >
                      {isToggling ? (
                        <Spinner size="sm" />
                      ) : (
                        <FaPowerOff
                          className={`w-4 h-4 ${item.enabled ? 'text-green-500' : ''}`}
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      title="Edit"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-md p-2 text-[var(--text-muted)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
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

      {/* Modal */}
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
                className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="BizHub Desktop"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                      Platform *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
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
                    label="Version *"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
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
                  label="URL *"
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://downloads.example.com/app-1.2.0.exe"
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
                    onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What's new in this version…"
                  />
                </div>

                <Toggle
                  label="Make this download available immediately"
                  checked={form.enabled !== false}
                  onChange={(v) => setForm({ ...form, enabled: v })}
                />

                {formError && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
                    {formError}
                  </div>
                )}
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