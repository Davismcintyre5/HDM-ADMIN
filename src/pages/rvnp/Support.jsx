import { useState, useEffect } from 'react';
import { getTickets } from '../../services/rvnp/support';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Pagination from '../../components/rvnp/ui/Pagination';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiEye } from 'react-icons/hi';

const FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];
const statusVariant = { open: 'danger', in_progress: 'warning', resolved: 'success', closed: 'default' };
const priorityVariant = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('open');
  const navigate = useNavigate();

  const fetchTickets = () => {
    setLoading(true);
    getTickets({ page, limit: 20, status: filter })
      .then(res => {
        setTickets(Array.isArray(res.data) ? res.data : res.tickets || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [page, filter]);

  const columns = [
    { key: 'subject', label: 'Subject', render: row => (
      <button onClick={() => navigate(`/rvnp/support/${row._id}`)} className="text-emerald-600 hover:underline font-medium text-sm">{row.subject || 'No subject'}</button>
    )},
    { key: 'user', label: 'User', render: row => row.user?.firstName ? `${row.user.firstName} ${row.user.lastName}` : '—' },
    { key: 'category', label: 'Category', render: row => <Badge variant="info">{row.category || 'general'}</Badge> },
    { key: 'priority', label: 'Priority', render: row => <Badge variant={priorityVariant[row.priority] || 'default'}>{row.priority || 'low'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status?.replace('_', ' ')}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <Button size="sm" variant="secondary" onClick={() => navigate(`/rvnp/support/${row._id}`)}><HiEye className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Support Tickets</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <Card>
        <Table columns={columns} data={tickets} loading={loading} emptyMessage="No tickets found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}