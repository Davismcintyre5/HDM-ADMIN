import { useState, useEffect } from 'react';
import { getPayments, getPaymentStats, refundPayment, completePayment, deletePayment } from '../../services/hdmai2/payments';
import Card from '../../components/hdmai2/ui/Card';
import Table from '../../components/hdmai2/ui/Table';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Pagination from '../../components/hdmai2/ui/Pagination';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';
import { HiEye, HiTrash } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'failed', label: 'Failed' },
];

const statusVariant = { pending: 'warning', completed: 'success', refunded: 'info', failed: 'danger' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    Promise.all([getPayments(params), getPaymentStats()])
      .then(([p, s]) => {
        setPayments(p?.data?.payments || p?.data || []);
        setTotalPages(p?.data?.pages || p?.pagination?.totalPages || 1);
        setStats(s?.data || s || {});
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, filter]);

  const handleRefund = async (id) => {
    if (!window.confirm('Refund this payment? This will downgrade the user.')) return;
    setActionLoading(true);
    try { await refundPayment(id); fetchData(); setViewModal({ open: false, payment: null }); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Manually confirm this payment?')) return;
    setActionLoading(true);
    try { await completePayment(id); fetchData(); setViewModal({ open: false, payment: null }); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deletePayment(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'user', label: 'User', render: row => (
      <button onClick={() => setViewModal({ open: true, payment: row })} className="text-blue-600 hover:underline font-medium text-sm">
        {row.user?.email || row.user?.name || '—'}
      </button>
    )},
    { key: 'amount', label: 'Amount', render: row => <span className="font-medium">{row.amountFormatted || `${row.currency || ''} ${row.amount}`}</span> },
    { key: 'plan', label: 'Plan', render: row => <Badge variant="info">{row.plan?.displayName || row.plan?.name || '—'}</Badge> },
    { key: 'method', label: 'Method', render: row => <span className="text-sm capitalize">{row.method || row.paymentMethod || '—'}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id, name: row.user?.email || row.user?.name })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBadge label="Total Revenue" value={stats.totalRevenueFormatted || stats.totalRevenue} />
        <StatBadge label="This Month" value={stats.monthRevenueFormatted || stats.monthRevenue} />
        <StatBadge label="Today" value={stats.todayRevenueFormatted || stats.todayRevenue} />
        <StatBadge label="Total Payments" value={stats.totalPayments} />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found." />
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, payment: null })} title="Payment Details" size="md">
        {viewModal.payment && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <Row label="User" value={viewModal.payment.user?.email || viewModal.payment.user?.name} />
              <Row label="Amount" value={viewModal.payment.amountFormatted || `${viewModal.payment.currency} ${viewModal.payment.amount}`} bold />
              <Row label="Plan" value={viewModal.payment.plan?.displayName || viewModal.payment.plan?.name} />
              <Row label="Method" value={viewModal.payment.method || viewModal.payment.paymentMethod} />
              <Row label="Status">
                <Badge variant={statusVariant[viewModal.payment.status] || 'default'}>{viewModal.payment.status}</Badge>
              </Row>
              <Row label="Date" value={formatDate(viewModal.payment.createdAt, 'full')} />
              {viewModal.payment.transactionId && <Row label="Transaction ID" value={viewModal.payment.transactionId} mono />}
              {viewModal.payment.refundReason && <Row label="Refund Reason" value={viewModal.payment.refundReason} />}
            </div>
            <div className="flex justify-end gap-2">
              {viewModal.payment.status === 'completed' && (
                <Button variant="warning" onClick={() => handleRefund(viewModal.payment._id)} loading={actionLoading}>Refund</Button>
              )}
              {viewModal.payment.status === 'pending' && (
                <Button variant="success" onClick={() => handleComplete(viewModal.payment._id)} loading={actionLoading}>Confirm Payment</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Payment" message={`Delete payment from ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-[var(--text-primary)]">{value ?? '—'}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''} ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
    </div>
  );
}