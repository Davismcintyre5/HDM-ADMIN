import { useState, useEffect } from 'react';
import { getPayments, refundPayment } from '../../services/nexguard/payments';
import Card from '../../components/nexguard/ui/Card';
import Table from '../../components/nexguard/ui/Table';
import SearchBar from '../../components/nexguard/ui/SearchBar';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Input from '../../components/nexguard/ui/Input';
import Modal from '../../components/nexguard/ui/Modal';
import Pagination from '../../components/nexguard/ui/Pagination';
import { formatDate } from '../../utils/nexguard/formatDate';
import { HiEye } from 'react-icons/hi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];
const statusVariant = { completed: 'success', pending: 'warning', failed: 'danger' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [viewModal, setViewModal] = useState({ open: false, payment: null });
  const [refundModal, setRefundModal] = useState({ open: false, id: null });
  const [refundForm, setRefundForm] = useState({ amount: 0, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

const fetchPayments = () => {
  setLoading(true);
  const params = { page, limit: 20 };
  if (filter !== 'all') params.status = filter;
  if (search) params.search = search;
  getPayments(params)
    .then(res => {
      setPayments(Array.isArray(res.data) ? res.data : res.payments || []);
      setPagination(res.meta || res.pagination || { page: 1, pages: 1 });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
};

  useEffect(() => { fetchPayments(); }, [page, filter, search]);

  const handleRefund = async () => {
    setActionLoading(true);
    try {
      await refundPayment(refundModal.id, refundForm);
      setRefundModal({ open: false, id: null });
      setRefundForm({ amount: 0, reason: '' });
      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
  };

  const formatAmount = (row) => {
    if (!row) return '—';
    return `${row.currency || ''} ${Number(row.amount).toLocaleString()}`;
  };

  const columns = [
    {
      key: 'client',
      label: 'Client',
      render: row => row.user?.name || row.client?.name || '—',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: row => <span className="font-medium">{formatAmount(row)}</span>,
    },
    {
      key: 'method',
      label: 'Method',
      render: row => <Badge variant="info">{row.method || '—'}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>,
    },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, payment: row })}>
            <HiEye className="w-4 h-4" />
          </Button>
          {row.status === 'completed' && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => setRefundModal({ open: true, id: row._id || row.id })}
            >
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payments</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search payments..." />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-cyan-600 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <Card>
        <Table
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments found."
        />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, payment: null })}
        title="Payment Details"
        size="md"
      >
        {viewModal.payment && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Client:</span>
                <span className="text-[var(--text-primary)]">
                  {viewModal.payment.user?.name || viewModal.payment.client?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Amount:</span>
                <span className="text-[var(--text-primary)] font-bold">
                  {formatAmount(viewModal.payment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Method:</span>
                <span className="text-[var(--text-primary)]">{viewModal.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Status:</span>
                <Badge variant={statusVariant[viewModal.payment.status]}>
                  {viewModal.payment.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Date:</span>
                <span className="text-[var(--text-primary)]">
                  {formatDate(viewModal.payment.createdAt, 'full')}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={refundModal.open}
        onClose={() => {
          setRefundModal({ open: false, id: null });
          setRefundForm({ amount: 0, reason: '' });
        }}
        title="Refund Payment"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            value={refundForm.amount}
            onChange={e => setRefundForm({ ...refundForm, amount: +e.target.value })}
          />
          <Input
            label="Reason"
            value={refundForm.reason}
            onChange={e => setRefundForm({ ...refundForm, reason: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setRefundModal({ open: false, id: null });
                setRefundForm({ amount: 0, reason: '' });
              }}
            >
              Cancel
            </Button>
            <Button variant="warning" onClick={handleRefund} loading={actionLoading}>
              Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}