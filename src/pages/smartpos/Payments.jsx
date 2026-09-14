import { useState, useEffect } from 'react';
import { getPayments, verifyPayment, retryPayment, refundPayment } from '../../services/smartpos/payments';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';
import { HiEye, HiCheck, HiRefresh } from 'react-icons/hi';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

const statusVariant = { pending: 'warning', succeeded: 'success', failed: 'danger', refunded: 'info' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [refundModal, setRefundModal] = useState({ open: false, id: null });
  const [refundReason, setRefundReason] = useState('');

  const fetchPayments = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    getPayments(params)
      .then(res => {
        setPayments(res?.data || []);
        setPagination(res?.meta || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [page, filter]);

  const handleVerify = async (id) => {
    if (!window.confirm('Verify this payment? Client will be activated/renewed.')) return;
    setActionLoading(true);
    try { await verifyPayment(id); fetchPayments(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRetry = async (id) => { setActionLoading(true); try { await retryPayment(id); fetchPayments(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const handleRefund = async () => {
    setActionLoading(true);
    try { await refundPayment(refundModal.id, { reason: refundReason }); setRefundModal({ open: false, id: null }); fetchPayments(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const formatAmount = (minor, currency) => `${currency || ''} ${((minor || 0) / 100).toLocaleString()}`;

  const columns = [
    { key: 'client', label: 'Client', render: row => <button onClick={() => setViewModal({ open: true, payment: row })} className="text-blue-600 hover:underline font-medium text-sm">{row.clientName || row.client?.name || '—'}</button> },
    { key: 'amount', label: 'Amount', render: row => <span className="font-medium">{formatAmount(row.amountMinor, row.currency)}</span> },
    { key: 'method', label: 'Method', render: row => <Badge variant="info">{row.method || '—'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}><HiEye className="w-3 h-3" /></Button>
        {row.status === 'pending' && <Button size="sm" variant="success" onClick={() => handleVerify(row._id || row.id)}><HiCheck className="w-3 h-3" /></Button>}
        {row.status === 'failed' && <Button size="sm" variant="warning" onClick={() => handleRetry(row._id || row.id)}><HiRefresh className="w-3 h-3" /></Button>}
        {row.status === 'succeeded' && <Button size="sm" variant="danger" onClick={() => { setRefundReason(''); setRefundModal({ open: true, id: row._id || row.id }); }}>Refund</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>

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
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, payment: null })} title="Payment Details" size="md">
        {viewModal.payment && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
            <Row label="Client" value={viewModal.payment.clientName || viewModal.payment.client?.name} />
            <Row label="Amount" value={formatAmount(viewModal.payment.amountMinor, viewModal.payment.currency)} bold />
            <Row label="Method" value={viewModal.payment.method} />
            <Row label="Status" value={viewModal.payment.status} />
            <Row label="Reference" value={viewModal.payment.reference} mono />
            <Row label="Date" value={formatDate(viewModal.payment.createdAt, 'full')} />
          </div>
        )}
      </Modal>

      <Modal open={refundModal.open} onClose={() => { setRefundModal({ open: false, id: null }); setRefundReason(''); }} title="Refund Payment">
        <Input label="Reason" value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Refund reason" required />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRefundModal({ open: false, id: null }); setRefundReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleRefund} loading={actionLoading} disabled={!refundReason.trim()}>Refund</Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''} ${mono ? 'font-mono text-xs' : ''}`}>{value ?? '—'}</span></div>;
}