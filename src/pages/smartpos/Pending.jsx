import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Modal from '../../components/smartpos/ui/Modal';
import Textarea from '../../components/smartpos/ui/Textarea';
import Select from '../../components/smartpos/ui/Select';
import Pagination from '../../components/smartpos/ui/Pagination';
import { useToast } from '../../context/smartpos/ToastContext';
import {
  getPendingList,
  approvePending,
  rejectPending,
} from '../../services/smartpos/pending';
import { relativeTime } from '../../utils/smartpos/formatDate';

const REASONS = [
  'Incomplete business information',
  'Unable to verify business',
  'Duplicate account',
  'Suspected fraud',
  'Outside service area',
  'Other',
];

export default function Pending() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getPendingList({ page: p, limit: 20 });
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

  const doApprove = async () => {
    if (!approveTarget) return;
    setBusy(true);
    try {
      await approvePending(approveTarget._id || approveTarget.id, { notes });
      toast.success('Client approved');
      setApproveTarget(null);
      setNotes('');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!rejectTarget) return;
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) {
      toast.error('Reason is required');
      return;
    }
    setBusy(true);
    try {
      await rejectPending(rejectTarget._id || rejectTarget.id, { reason: finalReason });
      toast.success('Client rejected');
      setRejectTarget(null);
      setReason(REASONS[0]);
      setCustomReason('');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'tenant',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.tenant?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)] capitalize">
            {row.tenant?.businessType}
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
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <span className="text-[var(--text-secondary)] capitalize">
          {row.tenant?.planId || '—'}
        </span>
      ),
    },
    {
      key: 'invoice',
      label: 'Payment',
      render: (row) => {
        const inv = row.invoice;
        if (!inv) return <Badge variant="default">No invoice</Badge>;
        if (inv.status === 'paid') return <Badge variant="success" dot>Paid</Badge>;
        return <Badge variant="warning" dot>Unpaid</Badge>;
      },
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-[var(--text-muted)] text-xs">
          {relativeTime(row.registeredAt)}
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
              navigate(`/smartpos/pending/${row._id || row.id}`);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setRejectTarget(row);
            }}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setApproveTarget(row);
            }}
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Pending approvals
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} awaiting review
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) => navigate(`/smartpos/pending/${row._id || row.id}`)}
            emptyMessage="No pending approvals. You're all caught up."
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Approve client"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button onClick={doApprove} loading={busy}>
              Approve
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          <strong>{approveTarget?.tenant?.name}</strong> will be activated and the owner
          notified.
        </p>
        <Textarea
          label="Internal notes"
          hint="Optional, admins only"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Modal>

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject client"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doReject} loading={busy}>
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The owner of <strong>{rejectTarget?.tenant?.name}</strong> will be emailed the
          reason.
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
    </div>
  );
}