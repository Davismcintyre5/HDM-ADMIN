import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiInbox,
  HiRefresh,
  HiArrowUp,
  HiExternalLink,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Table from '../../components/pharmasys/ui/Table';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Modal from '../../components/pharmasys/ui/Modal';
import Textarea from '../../components/pharmasys/ui/Textarea';
import Select from '../../components/pharmasys/ui/Select';
import Spinner from '../../components/pharmasys/ui/Spinner';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getApprovals,
  approvePending,
  rejectPending,
} from '../../services/pharmasys/pending';
import { approveInvoice, cancelInvoice } from '../../services/pharmasys/invoices';
import { relativeTime } from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import { statusVariant, statusLabel } from '../../utils/pharmasys/constants';

const TABS = [
  { key: 'registrations', label: 'Registrations', icon: HiInbox, urgent: false },
  { key: 'renewals', label: 'Renewals', icon: HiRefresh, urgent: false },
  { key: 'upgrades', label: 'Upgrades', icon: HiArrowUp, urgent: true },
];

const REASONS = [
  'Incomplete business information',
  'Unable to verify business',
  'Duplicate account',
  'Suspected fraud',
  'Outside service area',
  'Other',
];

const POLL_MS = 30000;

function slaColor(ms) {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return 'text-green-600 dark:text-green-400';
  if (hours < 24) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function methodLabel(code) {
  if (!code) return '—';
  return String(code)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Pending() {
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState('registrations');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [approveReg, setApproveReg] = useState(null);
  const [rejectReg, setRejectReg] = useState(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const [approveInv, setApproveInv] = useState(null);
  const [rejectInv, setRejectInv] = useState(null);
  const [invReason, setInvReason] = useState('');

  const load = useCallback(
    async (filter, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await getApprovals(filter);
        setData(res?.data || res);
      } catch (err) {
        if (!silent) toast.error(err.message || 'Failed to load');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const pollRef = useRef(null);
  useEffect(() => {
    pollRef.current = setInterval(() => load(tab, true), POLL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const counts = data?.counts || {
    registrations: 0,
    renewals: 0,
    upgrades: 0,
  };
  const rows = data?.items?.[tab] || [];

  // ─── Registrations actions ──────────────────────────────────

  const doApproveReg = async () => {
    if (!approveReg) return;
    setBusy(true);
    try {
      await approvePending(approveReg.id || approveReg._id, { notes });
      toast.success('Tenant approved');
      setApproveReg(null);
      setNotes('');
      load(tab);
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doRejectReg = async () => {
    if (!rejectReg) return;
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      await rejectPending(rejectReg.id || rejectReg._id, { reason: finalReason });
      toast.success('Tenant rejected');
      setRejectReg(null);
      setReason(REASONS[0]);
      setCustomReason('');
      load(tab);
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  // ─── Invoice (renewal/upgrade) actions ──────────────────────

  const doApproveInv = async () => {
    if (!approveInv) return;
    setBusy(true);
    try {
      await approveInvoice(approveInv.id || approveInv._id);
      toast.success('Approved');
      setApproveInv(null);
      load(tab);
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doRejectInv = async () => {
    if (!rejectInv) return;
    if (!invReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      await cancelInvoice(rejectInv.id || rejectInv._id, {
        reason: invReason.trim(),
      });
      toast.success('Rejected and cancelled');
      setRejectInv(null);
      setInvReason('');
      load(tab);
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  // ─── Columns ────────────────────────────────────────────────

  const regColumns = [
    {
      key: 'business',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.tenant?.name || '—'}
          </p>
          <p className="text-[10px] font-mono text-[var(--text-muted)]">
            {row.tenant?.slug || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">
            {row.owner?.fullName || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{row.owner?.email}</p>
          {row.owner?.phone && (
            <p className="text-xs text-[var(--text-muted)]">{row.owner.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <Badge variant="info">
          {row.tenant?.planCode || row.planCode || '—'}
        </Badge>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice',
      render: (row) => {
        const inv = row.invoice;
        if (!inv)
          return (
            <span className="text-xs text-[var(--text-muted)]">—</span>
          );
        const paid = inv.status === 'paid';
        return (
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatMoneyMajor(
                inv.amountDue ?? inv.total,
                inv.currency || 'KES'
              )}
            </p>
            <Badge variant={paid ? 'success' : 'warning'} dot>
              {paid ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {relativeTime(row.registeredAt || row.issuedAt)}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => {
        const p = row.priority || 'normal';
        const variant =
          p === 'high' ? 'danger' : p === 'low' ? 'default' : 'warning';
        return <Badge variant={variant}>{p}</Badge>;
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pharmasys/pending/${row.id || row._id}`);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setRejectReg(row);
            }}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setApproveReg(row);
            }}
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  const renewalColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-primary)]">
          {row.invoiceNumber || row.id?.slice(-8)}
        </span>
      ),
    },
    {
      key: 'business',
      label: 'Business',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">
          {row.tenant?.name || '—'}
        </span>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <Badge variant="info">
          {row.planCode || row.tenant?.planCode || '—'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.total, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'issuedAt',
      label: 'Issued',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {relativeTime(row.issuedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pharmasys/invoices/${row.id || row._id}`);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const upgradeColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-primary)]">
          {row.invoiceNumber || row.id?.slice(-8)}
        </span>
      ),
    },
    {
      key: 'business',
      label: 'Business',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">
          {row.tenant?.name || '—'}
        </span>
      ),
    },
    {
      key: 'upgrade',
      label: 'Upgrade',
      render: (row) => (
        <span className="text-xs">
          <span className="capitalize text-[var(--text-secondary)]">
            {row.currentPlan?.code || row.tenant?.planCode || '—'}
          </span>
          <span className="text-[var(--text-muted)] mx-1">→</span>
          <span className="capitalize font-medium text-[var(--text-primary)]">
            {row.targetPlan?.code || row.planCode || '—'}
          </span>
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.total, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'issuedAt',
      label: 'Waiting',
      render: (row) => {
        const since = row.issuedAt ? new Date(row.issuedAt).getTime() : Date.now();
        const ms = Date.now() - since;
        const hrs = Math.floor(ms / (1000 * 60 * 60));
        const label =
          hrs < 1
            ? `${Math.floor(ms / (1000 * 60))}m`
            : hrs < 24
            ? `${hrs}h`
            : `${Math.floor(hrs / 24)}d`;
        return (
          <span className={`text-xs font-medium ${slaColor(ms)}`}>{label}</span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pharmasys/invoices/${row.id || row._id}`);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setInvReason('');
              setRejectInv(row);
            }}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setApproveInv(row);
            }}
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  const columns =
    tab === 'registrations'
      ? regColumns
      : tab === 'renewals'
      ? renewalColumns
      : upgradeColumns;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Approvals
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Items waiting for your review
        </p>
      </div>

      {/* Tab strip */}
      <div className="grid grid-cols-3 gap-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = counts[t.key] || 0;
          const isActive = tab === t.key;
          const badgeVariant =
            count === 0 ? 'default' : t.urgent ? 'danger' : 'warning';
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition ${
                isActive
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span
                  className={`text-sm font-medium truncate ${
                    isActive
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {t.label}
                </span>
              </div>
              <Badge variant={badgeVariant} dot={count > 0}>
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      <Card padding={false}>
        <div className="p-4">
          {loading && !data ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              columns={columns}
              data={rows}
              loading={loading}
              rowKey={(r) => r.id || r._id}
              emptyMessage={
                tab === 'registrations'
                  ? 'No pending registrations'
                  : tab === 'renewals'
                  ? 'No renewals to review'
                  : 'No upgrades to review'
              }
            />
          )}
        </div>
      </Card>

      {/* Approve registration */}
      <Modal
        open={!!approveReg}
        onClose={() => setApproveReg(null)}
        title="Approve tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveReg(null)}>
              Cancel
            </Button>
            <Button onClick={doApproveReg} loading={busy}>
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          <strong>{approveReg?.tenant?.name}</strong> will be activated and the
          owner notified.
        </p>
        <Textarea
          label="Internal notes"
          hint="Optional, admins only"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* Reject registration */}
      <Modal
        open={!!rejectReg}
        onClose={() => setRejectReg(null)}
        title="Reject tenant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectReg(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doRejectReg} loading={busy}>
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The owner of <strong>{rejectReg?.tenant?.name}</strong> will be
          emailed the reason.
        </p>
        <Select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REASONS.map((r) => ({ value: r, label: r }))}
        />
        {reason === 'Other' && (
          <div className="mt-4">
            <Textarea
              label="Details"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>

      {/* Approve invoice (renewal/upgrade) */}
      <Modal
        open={!!approveInv}
        onClose={() => setApproveInv(null)}
        title={
          tab === 'renewals' ? 'Approve renewal?' : 'Approve upgrade?'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveInv(null)}>
              Cancel
            </Button>
            <Button variant="success" onClick={doApproveInv} loading={busy}>
              {tab === 'renewals' ? 'Approve renewal' : 'Approve upgrade'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-[var(--text-secondary)]">This will:</p>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-primary)]">
            {tab === 'upgrades' && approveInv?.targetPlan && (
              <li>
                Change <strong>{approveInv.tenant?.name}</strong> from{' '}
                <strong className="capitalize">
                  {approveInv.currentPlan?.code || '—'}
                </strong>{' '}
                to{' '}
                <strong className="capitalize">
                  {approveInv.targetPlan.code}
                </strong>
              </li>
            )}
            <li>Extend access by 1 month</li>
            <li>Notify the owner by email</li>
          </ul>
          <div className="pt-3 mt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
            <div className="flex justify-between py-1">
              <span>Amount</span>
              <span className="text-[var(--text-primary)] font-medium">
                {formatMoneyMajor(approveInv?.total ?? 0, approveInv?.currency || 'KES')}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Status</span>
              <span className="text-[var(--text-primary)]">
                {statusLabel(approveInv?.status)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Reject invoice (upgrades) */}
      <Modal
        open={!!rejectInv}
        onClose={() => setRejectInv(null)}
        title="Reject upgrade"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectInv(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={doRejectInv}
              loading={busy}
              disabled={!invReason.trim()}
            >
              Reject &amp; cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This cancels invoice{' '}
          <strong className="font-mono">{rejectInv?.invoiceNumber}</strong>. Any
          refund is handled manually.
        </p>
        <Textarea
          label="Reason"
          value={invReason}
          onChange={(e) => setInvReason(e.target.value)}
          rows={3}
          placeholder="Why are you rejecting this upgrade?"
        />
      </Modal>
    </div>
  );
}