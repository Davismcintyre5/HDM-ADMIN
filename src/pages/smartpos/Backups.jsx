import { useEffect, useState } from 'react';
import {
  HiDownload,
  HiMail,
  HiRefresh,
  HiTrash,
  HiPlus,
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
} from '../../services/smartpos/backups';
import { formatDateTime } from '../../utils/smartpos/formatDate';
import { bytes } from '../../utils/smartpos/formatters';

const STATUS_VARIANT = {
  success: 'success',
  running: 'warning',
  failed: 'danger',
  expired: 'default',
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
        <Button
          icon={<HiPlus className="w-4 h-4" />}
          onClick={createNow}
          loading={busy}
        >
          Create backup
        </Button>
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
    </div>
  );
}