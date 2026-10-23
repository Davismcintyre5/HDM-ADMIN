import { useEffect, useState } from 'react';
import {
  HiDownload,
  HiMail,
  HiTrash,
  HiPlus,
  HiCog,
  HiRefresh,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Table from '../../components/meteo/ui/Table';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Modal from '../../components/meteo/ui/Modal';
import Input from '../../components/meteo/ui/Input';
import Select from '../../components/meteo/ui/Select';
import Toggle from '../../components/meteo/ui/Toggle';
import Spinner from '../../components/meteo/ui/Spinner';
import Pagination from '../../components/meteo/ui/Pagination';
import ConfirmDialog from '../../components/meteo/ui/ConfirmDialog';
import { useToast } from '../../context/meteo/ToastContext';
import { useAuth } from '../../context/meteo/AuthContext';
import api from '../../services/meteo/api';
import {
  getBackups,
  createBackup,
  downloadBackup,
  sendBackupEmail,
  deleteBackup,
} from '../../services/meteo/backups';
import { formatDateTime } from '../../utils/meteo/formatDate';

const STATUS_VARIANT = {
  success: 'success',
  running: 'warning',
  failed: 'danger',
};

const DEFAULT_SETTINGS = {
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  maxBackups: 10,
  emailOnCompletion: false,
  emailRecipient: '',
};

const FREQUENCIES = [
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const RETENTION = [7, 14, 30, 90, 180, 365, 0].map((d) => ({
  value: d,
  label: d === 0 ? 'Keep forever' : `${d} days`,
}));

export default function Backups() {
  const toast = useToast();
  const { isSuperAdmin } = useAuth();

  const [tab, setTab] = useState('list');

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const [emailModal, setEmailModal] = useState({ open: false, backup: null });
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, backup: null });
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    getBackups({ page: p, limit: 20 })
      .then((res) => {
        const data = res?.data || res;
        setItems(data?.items || []);
        setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadSettings = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await api.get('/backups/settings');
      const data = res?.data?.data || res?.data || {};
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (err) {
      if (err.status === 404) {
        setSettingsError('Backup settings endpoint not configured on the backend.');
      } else {
        setSettingsError(err.message || 'Failed to load settings');
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'settings') loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await api.put('/backups/settings', settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      toast.info('Backup started — this may take up to 60 seconds');
      await createBackup();
      toast.success('Backup created');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      await downloadBackup(backup._id || backup.id);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const handleSendEmail = async () => {
    if (!emailModal.backup) return;
    setEmailSending(true);
    try {
      await sendBackupEmail(emailModal.backup._id || emailModal.backup.id, {
        email: emailTo.trim() || undefined,
      });
      toast.success('Backup emailed');
      setEmailModal({ open: false, backup: null });
      setEmailTo('');
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setEmailSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.backup) return;
    setDeleteBusy(true);
    try {
      await deleteBackup(confirmDelete.backup._id || confirmDelete.backup.id);
      toast.success('Backup deleted');
      setConfirmDelete({ open: false, backup: null });
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleteBusy(false);
    }
  };

  const columns = [
    {
      key: 'filename',
      label: 'File',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-[var(--text-primary)]">
            {row.filename}
          </p>
          {row.sizeHuman && (
            <p className="text-[10px] text-[var(--text-muted)]">
              {row.sizeHuman}
            </p>
          )}
        </div>
      ),
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
            title="Send by email"
          >
            <HiMail className="w-4 h-4" />
          </button>
          {isSuperAdmin && (
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
          )}
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
            {meta.total} backup{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        {tab === 'list' && isSuperAdmin && (
          <Button
            icon={<HiPlus className="w-4 h-4" />}
            onClick={handleCreate}
            loading={creating}
          >
            Create backup
          </Button>
        )}
        {tab === 'settings' && isSuperAdmin && !settingsError && (
          <Button
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={saveSettings}
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
              ? 'border-violet-600 text-violet-700 dark:text-violet-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          type="button"
        >
          Backups
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
            tab === 'settings'
              ? 'border-violet-600 text-violet-700 dark:text-violet-400'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          type="button"
        >
          <HiCog className="w-4 h-4" />
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
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : settingsError ? (
            <div className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg p-4">
              <p className="font-medium mb-1">Settings not available</p>
              <p className="text-xs">{settingsError}</p>
              <p className="text-xs mt-2">
                Ask the backend team to implement{' '}
                <code className="font-mono">GET /admin/backups/settings</code>{' '}
                and <code className="font-mono">PUT /admin/backups/settings</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Toggle
                label="Auto backup enabled"
                description="Run backups on a schedule"
                checked={!!settings.enabled}
                onChange={(v) => setSettings({ ...settings, enabled: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Frequency"
                  value={settings.frequency || 'daily'}
                  onChange={(e) =>
                    setSettings({ ...settings, frequency: e.target.value })
                  }
                  options={FREQUENCIES}
                  disabled={!settings.enabled}
                />
                <Input
                  label="Time (HH:mm)"
                  value={settings.time || '02:00'}
                  onChange={(e) =>
                    setSettings({ ...settings, time: e.target.value })
                  }
                  placeholder="02:00"
                  disabled={!settings.enabled}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Retention"
                  value={settings.retentionDays ?? 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      retentionDays: Number(e.target.value),
                    })
                  }
                  options={RETENTION}
                />
                <Input
                  label="Max backups"
                  type="number"
                  value={settings.maxBackups ?? 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxBackups: Number(e.target.value),
                    })
                  }
                />
              </div>
              <Toggle
                label="Email on completion"
                checked={!!settings.emailOnCompletion}
                onChange={(v) =>
                  setSettings({ ...settings, emailOnCompletion: v })
                }
              />
              {settings.emailOnCompletion && (
                <Input
                  label="Notification email"
                  type="email"
                  value={settings.emailRecipient || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, emailRecipient: e.target.value })
                  }
                  placeholder="admin@hdm.co.ke"
                />
              )}
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
            <Button onClick={handleSendEmail} loading={emailSending}>
              Send
            </Button>
          </>
        }
      >
        <Input
          label="Recipient email"
          type="email"
          hint="Leave empty to send to your own email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="admin@hdm.co.ke"
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, backup: null })}
        onConfirm={handleDelete}
        title="Delete backup"
        message={`Delete ${confirmDelete.backup?.filename}? The file will be removed from Cloudinary and the database.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteBusy}
      />
    </div>
  );
}