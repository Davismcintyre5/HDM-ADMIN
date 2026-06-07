import { useEffect, useState } from 'react';
import { getTransactions, processRefund } from '../../services/bridge/payments';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Pagination from '../../components/bridge/ui/Pagination';
import { formatDate } from '../../utils/bridge/formatDate';

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refundModal, setRefundModal] = useState({ open: false, id: null, amount: '', reason: '' });
  const [refunding, setRefunding] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    getTransactions({ page, limit: 20 })
      .then(res => {
        setTransactions(res.data || []);
        setRevenue(res.revenue || []);
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

  const statusV = { completed: 'success', pending: 'warning', failed: 'danger', refunded: 'indigo' };

  const columns = [
    { key: 'organizationId', label: 'Organization', render: (row) => row.organizationId?.name || '—' },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">${row.amount} {row.currency}</span> },
    { key: 'paymentMethod', label: 'Method', render: (row) => <span className="text-xs capitalize">{row.paymentMethod?.replace(/_/g, ' ')}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusV[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      row.status === 'completed' && (
        <Button size="sm" variant="warning" onClick={() => setRefundModal({ open: true, id: row._id || row.id, amount: row.amount, reason: '' })}>Refund</Button>
      )
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payments</h1>
      <Card>
        <Table columns={columns} data={transactions} loading={loading} emptyMessage="No transactions." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>

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
    </div>
  );
}