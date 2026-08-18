import { useState, useEffect } from 'react';
import { getTransactions } from '../../services/hdmnet/transactions';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Pagination from '../../components/hdmnet/ui/Pagination';
import { formatDate } from '../../utils/hdmnet/formatDate';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const statusVariant = { completed: 'success', pending: 'warning', failed: 'danger' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const fetchTransactions = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.status = filter;
    getTransactions(params)
      .then(res => {
        setTransactions(res?.data?.transactions || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, [page, filter]);

  const columns = [
    { key: 'provider', label: 'Provider', render: row => <span className="text-sm">{row.provider?.businessName || row.provider?.name || '—'}</span> },
    { key: 'customer', label: 'Customer', render: row => <span className="text-sm">{row.customer?.name || row.customerName || '—'}</span> },
    { key: 'amount', label: 'Amount', render: row => <span className="font-medium">{row.amount}</span> },
    { key: 'commission', label: 'Commission', render: row => <span className="text-sm">{row.commission || 0}</span> },
    { key: 'type', label: 'Type', render: row => <Badge variant="info">{row.type || 'subscription'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
        <Button variant="secondary">Export CSV</Button>
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
        <Table columns={columns} data={transactions} loading={loading} emptyMessage="No transactions found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}