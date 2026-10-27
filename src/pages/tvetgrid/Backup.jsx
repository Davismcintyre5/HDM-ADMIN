import { useEffect, useState } from 'react';
import {
  HiDownload,
  HiMail,
  HiTrash,
  HiPlus,
  HiRefresh,
  HiDatabase,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Toggle from '../../components/tvetgrid/ui/Toggle';
import Modal from '../../components/tvetgrid/ui/Modal';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import ConfirmDialog from '../../components/tvetgrid/ui/ConfirmDialog';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getBackupSettings,
  updateBackupSettings,
  createBackupNow,
  getBackups,
  getBackupDownloadUrl,
  emailBackup,
  restoreBackup,
  deleteBackup,
} from '../../services/tvetgrid/backup';
import { formatDateTime } from '../../utils/tvetgrid/formatDate';
import { BACKUP_FREQUENCIES, statusVariant } from '../../utils/tvetgrid/constants';

const DEFAULT_SETTINGS = {
  autoEnabled: false,
  frequency: 'daily',
  hourUtc: 3,
  dayOfWeek: 0,
  dayOfMonth: 1,
  emailOnCompletion: false,
  notifyEmails: [],
  retentionDays: 30,
};

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function Backup() {
  const toast = useToast();

  const [tab, setTab] = useState('list');

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [emailModal, setEmailModal] = useState({ open: false, backup: null });
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreText, setRestoreText] = useState('');
  const [restoring, setRestoring] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, backup: null });
  const [deleting, setDeleting] = useState(false);

  const loadBackups = () => {
    setLoading(true);
    getBackups({ page, limit: 20 })
      .then((res) => {
        const data = res?.data || res;
        setItems(Array.isArray(data) ? data : data?.items || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load backups'))
      .finally(() => setLoading(false));
  };

  const loadSettings = () => {
    setSettingsLoading(true);
    getBackupSettings()
      .then((res) => {
        const s = res?.data || res;
        setSettings({ ...DEFAULT_SETTINGS, ...s });
      })
      .catch((err) => toast.error(err.message || 'Failed to load settings'))
      .finally(() => setSettingsLoading(false));
  };

  useEffect(() => {
    loadBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (tab === 'settings') loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleCreate = async () => {
    setCreating(true);
    toast.info('Backup started — this can take 10–60 seconds');
    try {
      await createBackupNow();
      toast.success('Backup created');
      loadBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (row) => {
    try {
      const res = await getBackupDownloadUrl(row._id || row.id);
      const url = res?.data?.url || res?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else throw new Error('No download URL');
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const handleEmail = async () => {
    if (!emailModal.backup) return;
    const emails = emailTo
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (emails.length === 0) {
      toast.error('Enter at least one email');
      return;
    }
    setEmailSending(true);
    try {
      await emailBackup(emailModal.backup._id || emailModal.backup.id, {
        emails,
      });
      toast.success(`Backup sent to ${emails.length} address(es)`);
      setEmailModal({ open: false, backup: null });
      setEmailTo('');
    } catch (err) {
      toast.error(err.message || 'Failed to email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget || restoreText !== 'RESTORE') return;
    setRestoring(true);
    try {
      const res = await restoreBackup(restoreTarget._id || restoreTarget.id);
      const data = res?.data || res;
      const summary = data?.restored
        ? Object.entries(data.restored)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : 'complete';
      toast.success(`Restore complete — ${summary}`);
      setRestoreTarget(null);
      setRestoreText('');
      loadBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to restore');
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.backup) return;
    setDeleting(true);
    try {
      await deleteBackup(confirmDelete.backup._id || confirmDelete.backup.id);
      toast.success('Backup deleted');
      setConfirmDelete({ open: false, backup: null });
      loadBackups();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await updateBackupSettings(settings);
      toast.success('Backup settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSettingsSaving(false);
    }
  };

  const columns = [
    {
      key: 'fileName',
      label: 'File',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-[var(--text-primary)]">
            {row.fileName || row.filename || '—'}
          </p>
          {row.size && (
            <p className="text-[10px] text-[var(--text-muted)]">
              {Math.round((row.size || 0) / 1024)} KB
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'documentsCount',
      label: 'Docs',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.documentsCount ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {row.status || 'success'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDateTime(row.createdAt) : '—'}
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
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(row);
            }}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Download"
          >
            <HiDownload className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEmailTo('');
              setEmailModal({ open: true, backup: row });
            }}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Email"
          >
            <HiMail className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRestoreText('');
              setRestoreTarget(row);
            }}
            className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
            type="button"
            title="Restore"
          >
            <HiRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete({ open: true, backup: row });
            }}
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
            Backup
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Database snapshots stored in Cloudinary
          </p>
        </div>
        {tab === 'list' && (
          <Button
            icon={<HiPlus className="w-4 h-4" />}
            onClick={handleCreate}
            loading={creating}
          >
            Create backup
          </Button>
        )}
        {tab === 'settings' && (
          <Button
            icon={<HiDatabase className="w-4 h-4" />}
            onClick={handleSaveSettings}
            loading={settingsSaving}
          >
            Save settings
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[var(--border-color)]">
        <button
          onClick={() => setTab('list')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === 'list'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          type="button"
        >
          Backups
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === 'settings'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          type="button"
        >
          Settings
        </button>
      </div>

      {tab === 'list' && (
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
      )}

      {tab === 'settings' && (
        <Card>
          {settingsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <Toggle
                label="Auto backup enabled"
                description="Run backups on a schedule"
                checked={!!settings.autoEnabled}
                onChange={(v) =>
                  setSettings({ ...settings, autoEnabled: v })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Frequency"
                  value={settings.frequency || 'daily'}
                  onChange={(e) =>
                    setSettings({ ...settings, frequency: e.target.value })
                  }
                  options={BACKUP_FREQUENCIES}
                  disabled={!settings.autoEnabled}
                />
                <Input
                  label="Hour (UTC)"
                  type="number"
                  min="0"
                  max="23"
                  value={settings.hourUtc ?? 3}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hourUtc: Number(e.target.value),
                    })
                  }
                  disabled={!settings.autoEnabled}
                />
              </div>
              {settings.frequency === 'weekly' && (
                <Select
                  label="Day of week"
                  value={settings.dayOfWeek ?? 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dayOfWeek: Number(e.target.value),
                    })
                  }
                  options={DAYS}
                  disabled={!settings.autoEnabled}
                />
              )}
              {settings.frequency === 'monthly' && (
                <Input
                  label="Day of month"
                  type="number"
                  min="1"
                  max="28"
                  value={settings.dayOfMonth ?? 1}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dayOfMonth: Number(e.target.value),
                    })
                  }
                  disabled={!settings.autoEnabled}
                />
              )}
              <Input
                label="Retention (days)"
                type="number"
                value={settings.retentionDays ?? 30}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    retentionDays: Number(e.target.value),
                  })
                }
              />
              <Toggle
                label="Email on completion"
                checked={!!settings.emailOnCompletion}
                onChange={(v) =>
                  setSettings({ ...settings, emailOnCompletion: v })
                }
              />
              <Input
                label="Notification emails"
                hint="Comma-separated"
                value={(settings.notifyEmails || []).join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifyEmails: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="ops@tvetgrid.co.ke"
              />
              <dl className="pt-4 border-t border-[var(--border-color)] space-y-2 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <dt>Last run</dt>
                  <dd className="text-[var(--text-primary)]">
                    {settings.lastRunAt
                      ? formatDateTime(settings.lastRunAt)
                      : 'Never'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Last status</dt>
                  <dd className="text-[var(--text-primary)] capitalize">
                    {settings.lastRunStatus || 'never'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={emailModal.open}
        onClose={() => setEmailModal({ open: false, backup: null })}
        title="Email backup"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEmailModal({ open: false, backup: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleEmail} loading={emailSending}>
              Send
            </Button>
          </>
        }
      >
        <Input
          label="Recipient emails"
          hint="Comma-separated"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="ops@tvetgrid.co.ke, admin@tvetgrid.co.ke"
        />
      </Modal>

      <Modal
        open={!!restoreTarget}
        onClose={() => {
          setRestoreTarget(null);
          setRestoreText('');
        }}
        title="Restore backup"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRestoreTarget(null);
                setRestoreText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRestore}
              disabled={restoreText !== 'RESTORE'}
              loading={restoring}
            >
              Restore
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="font-medium mb-1">This destroys current data.</p>
            <p>
              Every collection in the database will be dropped and re-inserted
              from{' '}
              <strong className="font-mono">
                {restoreTarget?.fileName}
              </strong>
              .
            </p>
          </div>
          <Input
            label='Type "RESTORE" to confirm'
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
            placeholder="RESTORE"
            className="font-mono"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, backup: null })}
        onConfirm={handleDelete}
        title="Delete backup"
        message={`Delete ${confirmDelete.backup?.fileName}? The file will be removed from Cloudinary and the database.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}