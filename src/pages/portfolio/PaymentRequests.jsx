import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  HiPlus,
  HiCreditCard,
  HiRefresh,
  HiTrash,
  HiBan,
  HiMail,
  HiEye,
} from 'react-icons/hi';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import SearchBar from '../../components/portfolio/ui/SearchBar';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import Spinner from '../../components/portfolio/ui/Spinner';
import { useToast } from '../../context/portfolio/ToastContext';
import {
  getPaymentRequests,
  getPaymentRequest,
  createPaymentRequest,
  initiatePaymentRequest,
  cancelPaymentRequest,
  deletePaymentRequest,
} from '../../services/portfolio/paymentRequests';
import { formatDate, relativeTime } from '../../utils/portfolio/formatDate';

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'success', label: 'Success' },
  { key: 'failed', label: 'Failed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_VARIANT = {
  pending: 'default',
  processing: 'warning',
  success: 'success',
  failed: 'danger',
  cancelled: 'default',
};

const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Awaiting PIN',
  success: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const POLL_MS_LIST = 10000;
const POLL_MS_DETAIL = 3000;

function maskPhone(phone) {
  if (!phone) return '—';
  const s = String(phone);
  if (s.length < 8) return s;
  return `${s.slice(0, 3)}***${s.slice(-4)}`;
}

function formatKES(amount) {
  const n = Number(amount || 0);
  return `KES ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

const EMPTY_FORM = {
  description: '',
  phone: '',
  amount: '',
};

export default function PaymentRequests() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    success: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [detailId, setDetailId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    request: null,
  });
  const [confirmCancel, setConfirmCancel] = useState({
    open: false,
    request: null,
  });

  const pollRef = useRef(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await getPaymentRequests(
          filter ? { status: filter } : undefined
        );
        const data = res?.data || res || {};
        setRequests(data.requests || []);
        if (data.stats) setStats(data.stats);
      } catch (err) {
        if (!silent) toast.error(err.message || 'Failed to load requests');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [filter, toast]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const hasProcessing = requests.some((r) => r.status === 'processing');
    if (!hasProcessing) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(() => load(true), POLL_MS_LIST);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const filtered = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter(
      (r) =>
        r.reference?.toLowerCase().includes(q) ||
        r.invoiceNumber?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreate = async (sendStk = false) => {
    if (!form.phone.trim() || !form.amount) {
      toast.error('Phone and amount are required');
      return;
    }
    setCreating(true);
    try {
      const res = await createPaymentRequest({
        description: form.description.trim(),
        phone: form.phone.trim(),
        amount: Number(form.amount),
      });
      const created = res?.data || res;
      const id = created?._id || created?.id;
      const ref = created?.invoiceNumber || created?.reference || '';

      if (sendStk && id) {
        try {
          await initiatePaymentRequest(id);
          toast.success(
            ref ? `${ref} created · STK sent` : 'Request created · STK sent'
          );
        } catch (err) {
          toast.error(
            `${ref || 'Request'} created, STK failed: ${
              err.message || 'unknown'
            }`
          );
        }
      } else {
        toast.success(ref ? `${ref} created` : 'Request created');
      }

      setCreateOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleInitiate = async (row) => {
    const id = row._id || row.id;
    setActionLoading(id);
    try {
      await initiatePaymentRequest(id);
      toast.success('STK sent. Waiting for customer…');
      load(true);
    } catch (err) {
      toast.error(err.message || 'STK Push failed');
      load(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel.request) return;
    const id = confirmCancel.request._id || confirmCancel.request.id;
    setActionLoading(id);
    try {
      await cancelPaymentRequest(id);
      toast.success('Request cancelled');
      setConfirmCancel({ open: false, request: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.request) return;
    const id = confirmDelete.request._id || confirmDelete.request.id;
    setActionLoading(id);
    try {
      await deletePaymentRequest(id);
      toast.success('Request deleted');
      setConfirmDelete({ open: false, request: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'reference',
      label: 'Ref',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
          {row.invoiceNumber || row.reference || '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {maskPhone(row.phone)}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {formatKES(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={STATUS_VARIANT[row.status] || 'default'}
          dot
          className={row.status === 'processing' ? 'animate-pulse' : undefined}
        >
          {STATUS_LABEL[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: 'receipt',
      label: 'Receipt',
      render: (row) =>
        row.status === 'success' && row.mpesaReceiptNumber ? (
          <span className="text-[10px] font-mono text-green-600 dark:text-green-400">
            {row.mpesaReceiptNumber}
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {relativeTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => {
        const id = row._id || row.id;
        const busy = actionLoading === id;
        const buttons = [];

        if (row.status === 'pending') {
          buttons.push(
            <Button
              key="send"
              size="sm"
              variant="success"
              onClick={(e) => {
                e.stopPropagation();
                handleInitiate(row);
              }}
              loading={busy}
              title="Send STK"
            >
              Send
            </Button>
          );
        } else if (row.status === 'processing') {
          buttons.push(
            <Button
              key="resend"
              size="sm"
              variant="success"
              onClick={(e) => {
                e.stopPropagation();
                handleInitiate(row);
              }}
              loading={busy}
              title="Resend STK"
            >
              Resend
            </Button>
          );
          buttons.push(
            <Button
              key="check"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setDetailId(id);
              }}
              title="Check status"
            >
              <HiRefresh className="w-3.5 h-3.5" />
            </Button>
          );
        } else if (row.status === 'success') {
          buttons.push(
            <Button
              key="view"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setDetailId(id);
              }}
              title="View"
            >
              <HiEye className="w-3.5 h-3.5" />
            </Button>
          );
        } else if (row.status === 'failed') {
          buttons.push(
            <Button
              key="retry"
              size="sm"
              variant="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleInitiate(row);
              }}
              loading={busy}
              title="Retry"
            >
              Retry
            </Button>
          );
        }

        if (['pending', 'processing', 'failed'].includes(row.status)) {
          buttons.push(
            <Button
              key="cancel"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmCancel({ open: true, request: row });
              }}
              disabled={busy}
              title="Cancel"
            >
              <HiBan className="w-3.5 h-3.5" />
            </Button>
          );
        }

        buttons.push(
          <Button
            key="delete"
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete({ open: true, request: row });
            }}
            disabled={busy}
            title="Delete"
          >
            <HiTrash className="w-3.5 h-3.5" />
          </Button>
        );

        return <div className="flex justify-end gap-1">{buttons}</div>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Payment Requests
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {stats.total} total · {stats.pending} pending · {stats.success} paid
            {stats.failed > 0 && ` · ${stats.failed} failed`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={
              <HiRefresh
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            }
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
            New Request
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search ref, phone, description..."
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-green-600 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {loading && !requests.length ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <HiCreditCard className="w-12 h-12 text-[var(--text-muted)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {search.trim() || filter
                  ? 'No matching payment requests'
                  : 'No payment requests yet'}
              </p>
              {!search.trim() && !filter && (
                <>
                  <p className="text-xs text-[var(--text-muted)]">
                    Create your first to collect payment via M-Pesa.
                  </p>
                  <Button
                    icon={<HiPlus className="w-4 h-4" />}
                    onClick={openCreate}
                    size="sm"
                  >
                    New Request
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filtered}
              loading={loading}
              rowKey={(r) => r._id || r.id}
              onRowClick={(r) => setDetailId(r._id || r.id)}
            />
          )}
        </div>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Payment Request"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCreate(false)}
              loading={creating}
            >
              Save
            </Button>
            <Button
              onClick={() => handleCreate(true)}
              loading={creating}
              icon={<HiCreditCard className="w-4 h-4" />}
            >
              Save &amp; Send STK
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-lg p-3">
            An invoice number will be auto-assigned on save (e.g.{' '}
            <span className="font-mono">INV-0001-102026</span>).
          </p>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Website project balance"
          />
          <Input
            label="Customer Phone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0768784909"
          />
          <Input
            label="Amount (KES) *"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="50000"
          />
        </div>
      </Modal>

      <DetailModal
        id={detailId}
        onClose={() => setDetailId(null)}
        onChanged={() => load(true)}
      />

      <ConfirmDialog
        open={confirmCancel.open}
        onClose={() => setConfirmCancel({ open: false, request: null })}
        onConfirm={handleCancel}
        title="Cancel Request"
        message={`Cancel payment request ${
          confirmCancel.request?.invoiceNumber ||
          confirmCancel.request?.reference
        }? The customer will not be able to pay this request.`}
        confirmLabel="Cancel Request"
        variant="warning"
        loading={
          actionLoading ===
          (confirmCancel.request?._id || confirmCancel.request?.id)
        }
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, request: null })}
        onConfirm={handleDelete}
        title="Delete Request"
        message={`Permanently delete ${
          confirmDelete.request?.invoiceNumber ||
          confirmDelete.request?.reference
        }? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={
          actionLoading ===
          (confirmDelete.request?._id || confirmDelete.request?.id)
        }
      />
    </div>
  );
}

function DetailModal({ id, onClose }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (!silent) setLoading(true);
      try {
        const res = await getPaymentRequest(id);
        setData(res?.data || res);
      } catch (err) {
        if (!silent) toast.error(err.message || 'Failed to load');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, toast]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (data?.status !== 'processing') {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(() => load(true), POLL_MS_DETAIL);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status]);

  if (!id) return null;

  return (
    <Modal
      open={!!id}
      onClose={onClose}
      title={data?.invoiceNumber || data?.reference || 'Payment Request'}
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            icon={
              <HiRefresh
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            }
          >
            Refresh
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {loading && !data ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !data ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          Request not found
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={STATUS_VARIANT[data.status] || 'default'}
              dot
              className={
                data.status === 'processing' ? 'animate-pulse' : undefined
              }
            >
              {STATUS_LABEL[data.status] || data.status}
            </Badge>
            {data.smsReceiptSent && (
              <Badge variant="success">
                <HiMail className="w-3 h-3 mr-1" />
                SMS sent
              </Badge>
            )}
          </div>

          <dl className="space-y-2 text-sm">
            <Row label="Invoice #">
              <span className="font-mono text-xs">
                {data.invoiceNumber || data.reference || '—'}
              </span>
            </Row>
            <Row label="Description">{data.description || '—'}</Row>
            <Row label="Phone">
              <span className="font-mono">{data.phone}</span>
            </Row>
            <Row label="Amount">
              <span className="font-semibold">{formatKES(data.amount)}</span>
            </Row>
            <Row label="Status">
              {STATUS_LABEL[data.status] || data.status}
            </Row>
            <Row label="Attempts">{data.attempts ?? 0}</Row>
            {data.lastAttemptAt && (
              <Row label="Last attempt">
                {formatDate(data.lastAttemptAt, 'full')}
              </Row>
            )}
            <Row label="Created">
              {data.createdAt ? formatDate(data.createdAt, 'full') : '—'}
            </Row>
            {data.createdBy && (
              <Row label="Created by">
                {data.createdBy.name || data.createdBy}
              </Row>
            )}
          </dl>

          <div className="pt-4 border-t border-[var(--border-color)]">
            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              M-Pesa
            </p>
            <dl className="space-y-2 text-sm">
              {data.merchantRequestId && (
                <Row label="Merchant Req">
                  <span className="font-mono text-xs">
                    {data.merchantRequestId}
                  </span>
                </Row>
              )}
              {data.checkoutRequestId && (
                <Row label="Checkout Req">
                  <span className="font-mono text-xs">
                    {data.checkoutRequestId}
                  </span>
                </Row>
              )}
              <Row label="Receipt">
                <span className="font-mono">
                  {data.mpesaReceiptNumber || '—'}
                </span>
              </Row>
              <Row label="Result code">
                <span className="font-mono">
                  {data.resultCode !== undefined && data.resultCode !== ''
                    ? data.resultCode
                    : '—'}
                </span>
              </Row>
              <Row label="Result desc">{data.resultDesc || '—'}</Row>
              <Row label="Paid at">
                {data.paidAt ? formatDate(data.paidAt, 'full') : '—'}
              </Row>
            </dl>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs shrink-0">{label}</dt>
      <dd className="text-[var(--text-primary)] text-right text-xs break-all">
        {children}
      </dd>
    </div>
  );
}