import { useEffect, useState } from 'react';
import { getTransactions, processRefund, approvePayment, rejectPayment } from '../../services/bridge/payments';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Pagination from '../../components/bridge/ui/Pagination';
import ConfirmDialog from '../../components/bridge/ui/ConfirmDialog';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiEye, HiCheck, HiX } from 'react-icons/hi';

const CURRENCY_SYMBOLS = { USD: '$', KES: 'KSh', EUR: '€', GBP: '£' };

function formatPrice(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency || '$';
  if (currency === 'KES') return `${symbol} ${amount?.toLocaleString() || 0}`;
  return `${symbol}${amount || 0}`;
}

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, txn: null });
  const [refundModal, setRefundModal] = useState({ open: false, id: null, amount: '', reason: '' });
  const [refunding, setRefunding] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    getTransactions({ page, limit: 20 })
      .then(res => {
        setTransactions(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, [page]);

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await processRefund(refundModal.id, { amount: Number(refundModal.amount), reason: refundModal.reason });
      setRefundModal({ open: false, id: null, amount: '', reason: '' });
      fetchTransactions();
      alert('Refund processed');
    } catch (err) { alert(err.message); }
    setRefunding(false);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try { await approvePayment(confirm.id); setConfirm({ open: false, id: null, type: '' }); fetchTransactions(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectPayment(confirm.id, ''); setConfirm({ open: false, id: null, type: '' }); fetchTransactions(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const statusV = { completed: 'success', pending: 'warning', failed: 'danger', refunded: 'indigo', approved: 'success', rejected: 'danger' };

  const columns = [
    { key: 'user', label: 'User', render: (row) => (
      <div>
        <div className="font-medium text-[var(--text-primary)]">{row.userId?.fullName || row.userId?.firstName || 'N/A'}</div>
        <div className="text-xs text-[var(--text-muted)]">{row.userId?.email}</div>
      </div>
    )},
    { key: 'organization', label: 'Organization', render: (row) => (
      <span className="text-sm">{row.organizationId?.name || '—'}</span>
    )},
    { key: 'amount', label: 'Amount', render: (row) => (
      <span className="font-medium">{formatPrice(row.amount, row.currency)}</span>
    )},
    { key: 'paymentMethod', label: 'Method', render: (row) => (
      <Badge variant="indigo">{row.paymentMethod?.replace(/_/g, ' ')}</Badge>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={statusV[row.status] || 'default'}>{row.status}</Badge>
    )},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, txn: row })}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'pending' && (
          <>
            <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'approve' })}><HiCheck className="w-4 h-4" /></Button>
            <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'reject' })}><HiX className="w-4 h-4" /></Button>
          </>
        )}
        {row.status === 'completed' && (
          <Button size="sm" variant="warning" onClick={() => setRefundModal({ open: true, id: row._id, amount: row.amount, reason: '' })}>Refund</Button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payments</h1>
          <p className="text-xs text-[var(--text-muted)]">{pagination.total || transactions.length} transactions</p>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={transactions} loading={loading} emptyMessage="No transactions found." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, txn: null })} title="Transaction Details" size="md">
        {viewModal.txn && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Invoice:</span><span className="text-[var(--text-primary)] font-mono text-xs">{viewModal.txn.invoiceNumber || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">User:</span><span className="text-[var(--text-primary)]">{viewModal.txn.userId?.fullName || viewModal.txn.userId?.firstName}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.txn.userId?.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Organization:</span><span className="text-[var(--text-primary)]">{viewModal.txn.organizationId?.name}</span></div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Type:</span><Badge variant="indigo">{viewModal.txn.type}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount:</span><span className="text-[var(--text-primary)] font-medium">{formatPrice(viewModal.txn.amount, viewModal.txn.currency)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Method:</span><span className="text-[var(--text-primary)] capitalize">{viewModal.txn.paymentMethod?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={statusV[viewModal.txn.status] || 'default'}>{viewModal.txn.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Description:</span><span className="text-[var(--text-primary)]">{viewModal.txn.description || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Date:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.txn.createdAt, 'full')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal open={refundModal.open} onClose={() => setRefundModal({ open: false, id: null, amount: '', reason: '' })} title="Process Refund" size="sm">
        <div className="space-y-4">
          <Input label="Amount" type="number" value={refundModal.amount} onChange={(e) => setRefundModal(p => ({ ...p, amount: e.target.value }))} />
          <Input label="Reason" value={refundModal.reason} onChange={(e) => setRefundModal(p => ({ ...p, reason: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRefundModal({ open: false, id: null, amount: '', reason: '' })}>Cancel</Button>
            <Button variant="warning" onClick={handleRefund} loading={refunding}>Refund</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Approve/Reject */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'approve' ? 'Approve Payment' : 'Reject Payment'}
        message={confirm.type === 'approve' ? 'Approve this payment?' : 'Reject this payment?'}
        confirmLabel={confirm.type === 'approve' ? 'Approve' : 'Reject'}
        variant={confirm.type === 'approve' ? 'success' : 'danger'}
        onConfirm={confirm.type === 'approve' ? handleApprove : handleReject}
        loading={actionLoading}
      />
    </div>
  );
}