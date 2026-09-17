import { useState, useEffect } from 'react';
import {
  getPendingApprovals,
  approveClient,
  rejectClient
} from '../../services/smartpos/clients';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import { formatDate } from '../../utils/smartpos/formatDate';
import { formatMoney } from '../../utils/smartpos/formatMoney';
import { HiCheck, HiX, HiEye } from 'react-icons/hi';

export default function Subscriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [viewModal, setViewModal] = useState({ open: false, client: null });
  const [rejectModal, setRejectModal] = useState({ open: false, client: null });
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = () => {
    setLoading(true);
    getPendingApprovals()
      .then((res) => setItems(res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this client? They will be activated and can log in.')) return;
    setActionLoading(true);
    try {
      await approveClient(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectModal.client) return;
    setActionLoading(true);
    try {
      await rejectClient(rejectModal.client._id || rejectModal.client.id, {
        reason: rejectReason
      });
      setRejectModal({ open: false, client: null });
      setRejectReason('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Store',
      render: (row) => (
        <button
          onClick={() => setViewModal({ open: true, client: row })}
          className="text-[var(--accent)] hover:underline font-medium text-sm"
        >
          {row.name}
        </button>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <div className="text-sm">
          <p className="text-[var(--text-primary)]">{row.ownerName}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.ownerEmail}</p>
        </div>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => <Badge variant="info">{row.plan}</Badge>
    },
    {
      key: 'currency',
      label: 'Billing',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {row.subscriptionCurrency} · {row.storeCurrency}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Signed up',
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        const id = row._id || row.id;
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setViewModal({ open: true, client: row })}
              title="View"
            >
              <HiEye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => handleApprove(id)}
              title="Approve"
            >
              <HiCheck className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setRejectReason('');
                setRejectModal({ open: true, client: row });
              }}
              title="Reject"
            >
              <HiX className="w-3 h-3" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pending Approvals</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Paid signups awaiting review. Approve to activate.
          </p>
        </div>
        <Badge variant={items.length > 0 ? 'warning' : 'success'}>
          {items.length} pending
        </Badge>
      </div>

      <Card>
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No pending approvals. You're all caught up."
        />
      </Card>

      {/* View modal */}
      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, client: null })}
        title="Client Details"
        size="md"
      >
        {viewModal.client && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-[var(--radius)] p-4 space-y-2">
              <Row label="Store" value={viewModal.client.name} bold />
              <Row label="Slug" value={viewModal.client.slug} mono />
              <Row label="Plan" value={viewModal.client.plan} />
              <Row label="Status" value={viewModal.client.status} />
              <Row label="Subscription currency" value={viewModal.client.subscriptionCurrency} />
              <Row label="Store currency" value={viewModal.client.storeCurrency} />
              <Row label="Signed up" value={formatDate(viewModal.client.createdAt)} />
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-[var(--radius)] p-4 space-y-2">
              <Row label="Owner" value={viewModal.client.ownerName} />
              <Row label="Email" value={viewModal.client.ownerEmail} />
              <Row label="Phone" value={viewModal.client.ownerPhone || '—'} />
              <Row label="Country" value={viewModal.client.country || '—'} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setViewModal({ open: false, client: null })}
              >
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const c = viewModal.client;
                  setViewModal({ open: false, client: null });
                  setRejectReason('');
                  setRejectModal({ open: true, client: c });
                }}
              >
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  const id = viewModal.client._id || viewModal.client.id;
                  setViewModal({ open: false, client: null });
                  handleApprove(id);
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => { setRejectModal({ open: false, client: null }); setRejectReason(''); }}
        title="Reject Signup"
        size="sm"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This will reject <strong>{rejectModal.client?.name}</strong> and trigger a refund.
        </p>
        <Input
          label="Reason (sent to client)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Payment could not be verified"
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => { setRejectModal({ open: false, client: null }); setRejectReason(''); }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            loading={actionLoading}
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--text-secondary)] shrink-0">{label}</span>
      <span
        className={`text-[var(--text-primary)] text-right break-all ${bold ? 'font-bold' : ''} ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}