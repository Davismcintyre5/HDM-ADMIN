import { useState, useEffect } from 'react';
import { getVerificationQueue, approveVerification, rejectVerification } from '../../services/rvnp/verification';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { formatCurrency } from '../../utils/rvnp/formatters';
import { HiCheck, HiX, HiEye } from 'react-icons/hi';

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const statusVariant = { pending: 'warning', paid: 'success', approved: 'success', rejected: 'danger' };

export default function VerificationQueue() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, item: null });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');

  const fetchQueue = () => {
    setLoading(true);
    getVerificationQueue()
      .then(res => setAllData(Array.isArray(res.data) ? res.data : res.queue || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

const filtered = allData.filter(item => {
  if (filter === 'pending') return item.status === 'pending';
  if (filter === 'approved') return item.status === 'paid' || item.status === 'approved';
  return item.status === filter;
});

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this verification?')) return;
    setActionLoading(true);
    try { await approveVerification(id); fetchQueue(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectVerification(rejectModal.id, { reason: rejectReason }); setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); fetchQueue(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    {
      key: 'user', label: 'Student',
      render: row => (
        <button onClick={() => setViewModal({ open: true, item: row })} className="text-emerald-600 hover:underline font-medium">
          {row.user?.firstName} {row.user?.lastName}
        </button>
      ),
    },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.user?.email || '—'}</span> },
    {
      key: 'department', label: 'Department',
      render: row => <span className="text-sm capitalize">{row.user?.department || '—'}</span>,
    },
    {
      key: 'amount', label: 'Amount',
      render: row => <span className="font-medium">{formatCurrency(row.amount, row.currency)}</span>,
    },
    {
      key: 'method', label: 'Method',
      render: row => <Badge variant="info">{row.paymentMethodSlug?.replace(/-/g, ' ') || row.paymentMethodType || '—'}</Badge>,
    },
    {
      key: 'status', label: 'Status',
      render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>,
    },
    { key: 'createdAt', label: 'Requested', render: row => formatDate(row.createdAt) },
    {
      key: 'actions', label: 'Actions', render: row => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, item: row })}><HiEye className="w-4 h-4" /></Button>
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="success" onClick={() => handleApprove(row._id)}><HiCheck className="w-4 h-4" /> Approve</Button>
              <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, name: row.user?.firstName })}><HiX className="w-4 h-4" /> Reject</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Verification Queue</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}>
            {f.label} ({allData.filter(i => f.key === 'pending' ? i.status === 'pending' : i.status === f.key).length})
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={filtered} loading={loading} emptyMessage={`No ${filter} verifications.`} />
      </Card>

      {/* View Detail Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, item: null })} title="Verification Details" size="lg">
        {viewModal.item && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Student Information</h3>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <Row label="Name" value={`${viewModal.item.user?.firstName} ${viewModal.item.user?.lastName}`} bold />
                <Row label="Email" value={viewModal.item.user?.email} />
                <Row label="Department" value={viewModal.item.user?.department} capitalize />
                <Row label="Hostel" value={viewModal.item.user?.hostel?.replace(/_/g, ' ')} capitalize />
                <Row label="Joined" value={formatDate(viewModal.item.user?.createdAt)} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Payment Information</h3>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <Row label="Amount" value={formatCurrency(viewModal.item.amount, viewModal.item.currency)} bold />
                <Row label="Method" value={viewModal.item.paymentMethodSlug?.replace(/-/g, ' ') || viewModal.item.paymentMethodType} />
                <Row label="Purpose" value={viewModal.item.purpose} />
                <Row label="Status">
                  <Badge variant={statusVariant[viewModal.item.status] || 'default'}>{viewModal.item.status}</Badge>
                </Row>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Verification Details</h3>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
                <Row label="Confirmation Code" value={viewModal.item.confirmationCode} />
                <Row label="M-Pesa Receipt" value={viewModal.item.mpesaReceipt} />
                <Row label="M-Pesa Phone" value={viewModal.item.mpesaPhone} />
                <Row label="Card Last 4" value={viewModal.item.cardLastFour} />
                <Row label="Transaction ID" value={viewModal.item.transactionId} />
                <Row label="Requested" value={formatDate(viewModal.item.createdAt, 'full')} />
                {viewModal.item.verifiedBy && <Row label="Verified By" value={viewModal.item.verifiedBy?.name || viewModal.item.verifiedBy} />}
                {viewModal.item.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-medium text-xs">Rejection Reason:</span>
                    <p className="text-red-700 dark:text-red-300 text-xs mt-1">{viewModal.item.rejectionReason}</p>
                  </div>
                )}
                {viewModal.item.refundReason && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <span className="text-red-600 dark:text-red-400 font-medium text-xs">Refund Reason:</span>
                    <p className="text-red-700 dark:text-red-300 text-xs mt-1">{viewModal.item.refundReason}</p>
                  </div>
                )}
              </div>
            </div>

            {viewModal.item.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="danger" onClick={() => {
                  setRejectModal({ open: true, id: viewModal.item._id, name: viewModal.item.user?.firstName });
                  setViewModal({ open: false, item: null });
                }}><HiX className="w-4 h-4 mr-1" /> Reject</Button>
                <Button variant="success" onClick={() => {
                  handleApprove(viewModal.item._id);
                  setViewModal({ open: false, item: null });
                }}><HiCheck className="w-4 h-4 mr-1" /> Approve</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject — ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()}>Reject</Button>
        </div>
      </Modal>
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