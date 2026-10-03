import { useEffect, useState } from 'react';
import {
  HiDownload,
  HiMail,
  HiRefresh,
  HiTrash,
  HiPlus,
  HiCog,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Table from '../../components/pharmasys/ui/Table';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Modal from '../../components/pharmasys/ui/Modal';
import Input from '../../components/pharmasys/ui/Input';
import Select from '../../components/pharmasys/ui/Select';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Toggle from '../../components/pharmasys/ui/Toggle';
import Pagination from '../../components/pharmasys/ui/Pagination';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getBackups,
  createBackup,
  downloadBackup,
  sendBackupEmail,
  restoreBackup,
  deleteBackup,
  getBackupSettings,
  updateBackupSettings,
} from '../../services/pharmasys/backups';
import { formatDateTime } from '../../utils/pharmasys/formatDate';
import { bytes } from '../../utils/pharmasys/formatters';

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
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
  { value: 0, label: 'Keep forever' },
];

const DEFAULT_SETTINGS = {
  backup_enabled: true,
  backup_auto_enabled: true,
  backup_frequency: 'daily',
  backup_time: '03:00',
  backup_retention_days: 30,
  backup_notify_on_success: true,
  backup_notify_on_fail: true,
  backup_notify_emails: [],
  backup_retry_on_failure: true,
  backup_max_retries: 2,
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
      setItems(res?.data || []);
      setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
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
      const data = res?.data || res || {};
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const patchSettings = (patch) =>
    setSettings((s) => ({ ...s, ...patch }));

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await updateBackupSettings(settings);
      toast.success('Settings saved');
      setSettingsOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const createNow = async () => {
    setBusy(true);
    try {
      await createBackup();
      toast.success('Backup started');
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
      await sendBackupEmail(emailTarget._id || emailTarget.id, { to: emailTo });
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
      await restoreBackup(restoreTarget._id || restoreTarget.id, {
        confirm: true,
      });
      toast.success('Restore started');
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
          <p className="text-xs text-[var(--text-muted)]">
            {bytes(row.sizeBytes)}
          </p>
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Backups
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} backups stored in Cloudinary
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
          placeholder="admin@pharmasys.co.ke"
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
            This destroys current data with --drop. A pre-restore backup is
            created automatically.
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
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings} loading={settingsSaving}>
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
            <div className="space-y-1">
              <Toggle
                label="Backups enabled"
                description="Master switch for all backups"
                checked={settings.backup_enabled !== false}
                onChange={(v) => patchSettings({ backup_enabled: v })}
              />
              <Toggle
                label="Auto backups"
                description="Run scheduled backups automatically"
                checked={settings.backup_auto_enabled !== false}
                onChange={(v) => patchSettings({ backup_auto_enabled: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Frequency"
                value={settings.backup_frequency || 'daily'}
                onChange={(e) =>
                  patchSettings({ backup_frequency: e.target.value })
                }
                options={FREQUENCIES}
              />
              <Input
                label="Time"
                type="time"
                value={settings.backup_time || '03:00'}
                onChange={(e) =>
                  patchSettings({ backup_time: e.target.value })
                }
              />
            </div>

            <Select
              label="Retention"
              value={settings.backup_retention_days ?? 30}
              onChange={(e) =>
                patchSettings({
                  backup_retention_days: Number(e.target.value),
                })
              }
              options={RETENTION_OPTIONS.map((r) => ({
                value: r.value,
                label: r.label,
              }))}
            />

            <div className="space-y-1">
              <Toggle
                label="Notify on success"
                checked={!!settings.backup_notify_on_success}
                onChange={(v) =>
                  patchSettings({ backup_notify_on_success: v })
                }
              />
              <Toggle
                label="Notify on failure"
                checked={!!settings.backup_notify_on_fail}
                onChange={(v) => patchSettings({ backup_notify_on_fail: v })}
              />
            </div>

            <Input
              label="Notification emails"
              hint="Comma-separated"
              value={(settings.backup_notify_emails || []).join(', ')}
              onChange={(e) =>
                patchSettings({
                  backup_notify_emails: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="admin@pharmasys.co.ke, ops@pharmasys.co.ke"
            />

            <div className="grid grid-cols-2 gap-4">
              <Toggle
                label="Retry on failure"
                checked={settings.backup_retry_on_failure !== false}
                onChange={(v) =>
                  patchSettings({ backup_retry_on_failure: v })
                }
              />
              <Input
                label="Max retries"
                type="number"
                value={settings.backup_max_retries ?? 2}
                onChange={(e) =>
                  patchSettings({
                    backup_max_retries: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}