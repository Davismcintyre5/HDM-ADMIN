import { useEffect, useState } from 'react';
import {
  HiDownload,
  HiMail,
  HiRefresh,
  HiTrash,
  HiPlus,
  HiCog,
} from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Modal from '../../components/smartpos/ui/Modal';
import Input from '../../components/smartpos/ui/Input';
import Spinner from '../../components/smartpos/ui/Spinner';
import Pagination from '../../components/smartpos/ui/Pagination';
import { useToast } from '../../context/smartpos/ToastContext';
import {
  getBackups,
  createBackup,
  downloadBackup,
  emailBackup,
  restoreBackup,
  deleteBackup,
  getBackupSettings,
  updateBackupSettings,
} from '../../services/smartpos/backups';
import { formatDateTime } from '../../utils/smartpos/formatDate';
import { bytes } from '../../utils/smartpos/formatters';

const STATUS_VARIANT = {
  success: 'success',
  running: 'warning',
  failed: 'danger',
  expired: 'default',
};

const FREQUENCIES = [
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const RETENTION_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
  { value: 0, label: 'Keep forever' },
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DEFAULT_SETTINGS = {
  enabled: false,
  frequency: 'daily',
  hour: 2,
  minute: 0,
  dayOfWeek: 1,
  dayOfMonth: 1,
  retentionDays: 90,
  emailTo: '',
  emailOnSuccess: false,
  emailOnFailure: true,
};

export default function Backups() {
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);

  const [emailTarget, setEmailTarget] = useState(null);
  const [emailTo, setEmailTo] = useState('');

  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreConfirm, setRestoreConfirm] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getBackups({ page: p, limit: 20 });
      const data = res?.data || res;
      setItems(data?.data || data || []);
      setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openSettings = async () => {
    setSettingsOpen(true);
    setSettingsLoading(true);
    try {
      const res = await getBackupSettings();
      const data = res?.data || res;
      setSettings({ ...DEFAULT_SETTINGS, ...(data || {}) });
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await updateBackupSettings(settings);
      const data = res?.data || res;
      setSettings({ ...DEFAULT_SETTINGS, ...(data || {}) });
      toast.success('Settings saved');
      setSettingsOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const patchSettings = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const createNow = async () => {
    setBusy(true);
    try {
      await createBackup();
      toast.success('Backup created');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (row) => {
    try {
      await downloadBackup(row._id || row.id);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const sendEmail = async () => {
    if (!emailTarget || !emailTo) return;
    setBusy(true);
    try {
      await emailBackup(emailTarget._id || emailTarget.id, { to: emailTo });
      toast.success('Email queued');
      setEmailTarget(null);
      setEmailTo('');
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    if (!restoreTarget || restoreConfirm !== restoreTarget.filename) return;
    setBusy(true);
    try {
      await restoreBackup(restoreTarget._id || restoreTarget.id, { confirm: true });
      toast.success('Restore complete');
      setRestoreTarget(null);
      setRestoreConfirm('');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to restore');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteBackup(deleteTarget._id || deleteTarget.id);
      toast.success('Backup deleted');
      setDeleteTarget(null);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'filename',
      label: 'Filename',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-[var(--text-primary)]">
            {row.filename}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{bytes(row.sizeBytes)}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant="default">{row.type}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'completedAt',
      label: 'Completed',
      render: (row) => (
        <span className="text-[var(--text-muted)] text-xs">
          {row.completedAt ? formatDateTime(row.completedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'durationMs',
      label: 'Duration',
      render: (row) => (
        <span className="text-[var(--text-muted)] text-xs">
          {row.durationMs ? `${(row.durationMs / 1000).toFixed(1)}s` : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleDownload(row)}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Download"
          >
            <HiDownload className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEmailTarget(row)}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Email"
          >
            <HiMail className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setRestoreConfirm('');
              setRestoreTarget(row);
            }}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Restore"
          >
            <HiRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-red-600"
            type="button"
            title="Delete"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} backups stored
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<HiCog className="w-4 h-4" />}
            onClick={openSettings}
          >
            Auto settings
          </Button>
          <Button
            icon={<HiPlus className="w-4 h-4" />}
            onClick={createNow}
            loading={busy}
          >
            Create backup
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No backups yet"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        open={!!emailTarget}
        onClose={() => setEmailTarget(null)}
        title="Email backup"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEmailTarget(null)}>
              Cancel
            </Button>
            <Button onClick={sendEmail} loading={busy}>
              Send
            </Button>
          </>
        }
      >
        <Input
          label="Recipient email"
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="admin@smartpos.co.ke"
        />
      </Modal>

      <Modal
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title="Restore backup"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRestoreTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doRestore}
              disabled={restoreConfirm !== restoreTarget?.filename}
              loading={busy}
            >
              Restore
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            This replaces all data. A pre-restore backup is created automatically.
          </div>
          <Input
            label="Type the filename to confirm"
            value={restoreConfirm}
            onChange={(e) => setRestoreConfirm(e.target.value)}
            placeholder={restoreTarget?.filename}
            className="font-mono text-xs"
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete backup"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete} loading={busy}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Permanently delete{' '}
          <strong className="font-mono">{deleteTarget?.filename}</strong>?
        </p>
      </Modal>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Automatic backup settings"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings} loading={settingsSaving} disabled={settingsLoading}>
              Save
            </Button>
          </>
        }
      >
        {settingsLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Enable automatic backups
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Scheduled backups run in the background.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => patchSettings({ enabled: e.target.checked })}
                className="w-5 h-5 accent-[var(--accent)]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Frequency
                </label>
                <select
                  value={settings.frequency}
                  onChange={(e) => patchSettings({ frequency: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Retention
                </label>
                <select
                  value={settings.retentionDays}
                  onChange={(e) =>
                    patchSettings({ retentionDays: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  {RETENTION_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={settings.frequency === 'hourly' ? 'Minute (0–59)' : 'Hour (0–23)'}
                type="number"
                min={settings.frequency === 'hourly' ? 0 : 0}
                max={settings.frequency === 'hourly' ? 59 : 23}
                value={settings.frequency === 'hourly' ? settings.minute : settings.hour}
                onChange={(e) =>
                  settings.frequency === 'hourly'
                    ? patchSettings({ minute: Number(e.target.value) })
                    : patchSettings({ hour: Number(e.target.value) })
                }
              />
              {settings.frequency !== 'hourly' && (
                <Input
                  label="Minute (0–59)"
                  type="number"
                  min={0}
                  max={59}
                  value={settings.minute}
                  onChange={(e) => patchSettings({ minute: Number(e.target.value) })}
                />
              )}
              {settings.frequency === 'hourly' && (
                <div />
              )}
            </div>

            {settings.frequency === 'weekly' && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Day of week
                </label>
                <select
                  value={settings.dayOfWeek}
                  onChange={(e) =>
                    patchSettings({ dayOfWeek: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  {DAYS_OF_WEEK.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {settings.frequency === 'monthly' && (
              <Input
                label="Day of month (1–28)"
                type="number"
                min={1}
                max={28}
                value={settings.dayOfMonth}
                onChange={(e) =>
                  patchSettings({ dayOfMonth: Number(e.target.value) })
                }
              />
            )}

            <div className="border-t border-[var(--border)] pt-4 space-y-3">
              <Input
                label="Email notifications to"
                type="email"
                value={settings.emailTo}
                onChange={(e) => patchSettings({ emailTo: e.target.value })}
                placeholder="admin@smartpos.co.ke"
              />
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailOnSuccess}
                  onChange={(e) =>
                    patchSettings({ emailOnSuccess: e.target.checked })
                  }
                  className="accent-[var(--accent)]"
                />
                Email on success
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailOnFailure}
                  onChange={(e) =>
                    patchSettings({ emailOnFailure: e.target.checked })
                  }
                  className="accent-[var(--accent)]"
                />
                Email on failure
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}