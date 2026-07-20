import { useState, useEffect } from 'react';
import { getApprovals, approveApproval, rejectApproval, deleteApproval } from '../../services/nexguard/approvals';
import Card from '../../components/nexguard/ui/Card';
import Table from '../../components/nexguard/ui/Table';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Input from '../../components/nexguard/ui/Input';
import Modal from '../../components/nexguard/ui/Modal';
import ConfirmDialog from '../../components/nexguard/ui/ConfirmDialog';
import Pagination from '../../components/nexguard/ui/Pagination';
import { formatDate } from '../../utils/nexguard/formatDate';
import { HiCheck, HiX, HiEye, HiTrash } from 'react-icons/hi';

const FILTERS = [
  { key: 'pending', label: 'All Pending', params: { status: 'pending' } },
  { key: 'new', label: 'New Accounts', params: { status: 'pending', type: 'new' } },
  { key: 'renewal', label: 'Renewals', params: { status: 'pending', type: 'renewal' } },
];

const PROCESSED_TABS = [
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger' };
const typeVariant = { new: 'success', renewal: 'info' };

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('pending');
  const [processedTab, setProcessedTab] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, approval: null });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchApprovals = () => {
    setLoading(true);
    const params = { page, limit: 20 };

    if (processedTab) {
      params.status = processedTab;
    } else {
      const tab = FILTERS.find(f => f.key === activeTab);
      Object.assign(params, tab?.params || { status: 'pending' });
    }

    getApprovals(params)
      .then(res => {
        setApprovals(Array.isArray(res.data) ? res.data : res.approvals || []);
        setPagination(res.meta || res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApprovals(); }, [page, activeTab, processedTab]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this application?')) return;
    setActionLoading(true);
    try {
      await approveApproval(id);
      setApprovals(prev => prev.filter(a => (a._id || a.id) !== id));
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      fetchApprovals();
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectApproval(rejectModal.id, rejectReason);
      setApprovals(prev => prev.filter(a => (a._id || a.id) !== rejectModal.id));
      setRejectModal({ open: false, id: null, name: '' });
      setRejectReason('');
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteApproval(confirmDelete.id);
      setApprovals(prev => prev.filter(a => (a._id || a.id) !== confirmDelete.id));
      setConfirmDelete({ open: false, id: null, name: '' });
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
  };

  const formatAmount = (row) => {
    if (!row) return '—';
    const curr = row.currency || '';
    return curr ? `${curr} ${Number(row.amount).toLocaleString()}` : Number(row.amount).toLocaleString();
  };

  const isPending = !processedTab;

  const columns = [
    {
      key: 'user',
      label: 'Client',
      render: row => (
        <button
          onClick={() => setViewModal({ open: true, approval: row })}
          className="text-cyan-600 hover:underline font-medium"
        >
          {row.user?.name || 'N/A'}
        </button>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: row => <span className="text-sm text-[var(--text-secondary)]">{row.user?.email || '—'}</span>,
    },
    {
      key: 'plan',
      label: 'Plan',
      render: row => <span className="capitalize">{row.plan || '—'}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: row => (
        <Badge variant={typeVariant[row.type] || 'default'}>
          {row.type === 'renewal' && row.previousPlan
            ? `Renewal (${row.previousPlan})`
            : row.type === 'new'
              ? 'New'
              : row.type || '—'}
        </Badge>
      ),
    },
    {
      key: 'billing',
      label: 'Billing',
      render: row => <span className="capitalize">{row.billing || '—'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: row => <span className="font-medium">{formatAmount(row)}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: row => <Badge variant="info">{row.paymentMethod?.replace(/_/g, ' ') || '—'}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>,
    },
    { key: 'date', label: 'Date', render: row => formatDate(row.date) },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, approval: row })}>
            <HiEye className="w-4 h-4" />
          </Button>
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="success" disabled={actionLoading} onClick={() => handleApprove(row._id || row.id)}>
                <HiCheck className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="danger" disabled={actionLoading}
                onClick={() => setRejectModal({ open: true, id: row._id || row.id, name: row.user?.name })}>
                <HiX className="w-4 h-4" />
              </Button>
            </>
          )}
          {row.status !== 'pending' && (
            <Button size="sm" variant="danger" disabled={actionLoading}
              onClick={() => setConfirmDelete({ open: true, id: row._id || row.id, name: row.user?.name })}>
              <HiTrash className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Approvals</h1>

      {/* Pending Tabs */}
      <div className="flex gap-2 mb-2 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setActiveTab(f.key); setProcessedTab(null); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === f.key && !processedTab
                ? 'bg-cyan-600 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Processed Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {PROCESSED_TABS.map(f => (
          <button
            key={f.key}
            onClick={() => { setProcessedTab(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              processedTab === f.key
                ? 'bg-cyan-600 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={approvals} loading={loading}
          emptyMessage={`No ${processedTab || activeTab} approvals.`} />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, approval: null })}
        title="Approval Details" size="md">
        {viewModal.approval && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <Row label="Client" value={viewModal.approval.user?.name} />
              <Row label="Email" value={viewModal.approval.user?.email} />
              <Row label="Type">
                <Badge variant={typeVariant[viewModal.approval.type] || 'default'}>
                  {viewModal.approval.type || '—'}
                </Badge>
              </Row>
              <Row label="Plan" value={viewModal.approval.plan} capitalize />
              {viewModal.approval.previousPlan && (
                <Row label="Previous Plan" value={viewModal.approval.previousPlan} capitalize />
              )}
              <Row label="Billing" value={viewModal.approval.billing} capitalize />
              <Row label="Amount" value={formatAmount(viewModal.approval)} bold />
              <Row label="Method" value={viewModal.approval.paymentMethod?.replace(/_/g, ' ')} />
              <Row label="Status">
                <Badge variant={statusVariant[viewModal.approval.status] || 'default'}>
                  {viewModal.approval.status}
                </Badge>
              </Row>
              <Row label="Date" value={formatDate(viewModal.approval.date, 'full')} />
              {viewModal.approval.proofOfPayment && <Row label="Proof" value={viewModal.approval.proofOfPayment} />}
              {viewModal.approval.reviewedBy && (
                <Row label="Reviewed By" value={viewModal.approval.reviewedBy?.name || viewModal.approval.reviewedBy} />
              )}
              {viewModal.approval.reviewedAt && (
                <Row label="Reviewed At" value={formatDate(viewModal.approval.reviewedAt, 'full')} />
              )}
              {viewModal.approval.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <span className="text-red-600 dark:text-red-400 font-medium text-xs">Rejection Reason:</span>
                  <p className="text-red-700 dark:text-red-300 text-xs mt-1">{viewModal.approval.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open}
        onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}
        title={`Reject — ${rejectModal.name}`}>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          This will reject the application and notify the user.
        </p>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          placeholder="Reason for rejection" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary"
            onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()}>
            Reject
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, name: '' })}
        onConfirm={handleDelete} title="Delete Record"
        message={`Delete approval record for ${confirmDelete.name}?`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold, capitalize, children }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {children || (
        <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''} ${capitalize ? 'capitalize' : ''}`}>
          {value || '—'}
        </span>
      )}
    </div>
  );
}