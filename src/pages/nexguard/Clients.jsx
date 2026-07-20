import { useState, useEffect } from 'react';
import { getClients } from '../../services/nexguard/clients';
import Card from '../../components/nexguard/ui/Card';
import Table from '../../components/nexguard/ui/Table';
import SearchBar from '../../components/nexguard/ui/SearchBar';
import Badge from '../../components/nexguard/ui/Badge';
import Button from '../../components/nexguard/ui/Button';
import Pagination from '../../components/nexguard/ui/Pagination';
import { formatDate } from '../../utils/nexguard/formatDate';
import { HiEye, HiKey } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'deactivated', label: 'Deactivated' },
];

const statusVariant = {
  active: 'success', trial: 'info', expired: 'warning',
  cancelled: 'danger', suspended: 'danger', none: 'default',
};

const planVariant = {
  'Free Trial': 'info', Pro: 'success', Enterprise: 'warning',
  Pending: 'default', None: 'default',
};

const getRemainingDays = (row) => {
  if (!row.currentPeriodEnd) return null;
  const now = new Date().getTime();
  const end = new Date(row.currentPeriodEnd).getTime();
  const diff = end - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 30) return `${Math.floor(days / 30)}mo ${days % 30}d`;
  return `${days}d left`;
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('active');
  const navigate = useNavigate();

  const fetchClients = () => {
    setLoading(true);
    const params = { page, limit: 20, status: filter };
    if (search) params.search = search;
    getClients(params)
      .then(res => {
        setClients(Array.isArray(res.data) ? res.data : res.clients || []);
        setPagination(res.meta || res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [page, filter, search]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: row => (
        <button
          onClick={() => navigate(`/nexguard/clients/${row._id || row.id}`)}
          className="text-cyan-600 hover:underline font-medium"
        >
          {row.name || 'N/A'}
        </button>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email || '—'}</span>,
    },
    {
      key: 'plan',
      label: 'Plan',
      render: row => <Badge variant={planVariant[row.plan] || 'default'}>{row.plan || 'None'}</Badge>,
    },
    {
      key: 'subscriptionStatus',
      label: 'Status',
      render: row => (
        <div className="flex items-center gap-1.5">
          <Badge variant={statusVariant[row.subscriptionStatus] || 'default'}>
            {row.subscriptionStatus || 'none'}
          </Badge>
          {(row.subscriptionStatus === 'trial' || row.subscriptionStatus === 'active') && row.currentPeriodEnd && (
            <span className={`text-xs ${
              getRemainingDays(row) === 'Expired' ? 'text-red-500' : 'text-[var(--text-muted)]'
            }`}>
              · {getRemainingDays(row)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'license',
      label: 'License',
      render: row => (
        <div className="text-sm">
          {row.license ? (
            <div className="flex items-center gap-1">
              <HiKey className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="text-[var(--text-primary)] font-mono text-xs">{row.license.key || '—'}</span>
            </div>
          ) : (
            <span className="text-[var(--text-muted)]">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'devices',
      label: 'Devices',
      render: row => (
        <span className="text-sm">
          {row.devices != null ? `${row.devices}/${row.deviceLimit || '—'}` : '—'}
        </span>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: row => formatDate(row.registeredAt),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: row => row.lastLogin ? formatDate(row.lastLogin) : '—',
    },
    {
      key: 'alerts',
      label: 'Alerts',
      render: row => <span className="text-sm">{row.alerts ?? '—'}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: row => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/nexguard/clients/${row._id || row.id}`)}
        >
          <HiEye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clients</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search clients..." />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
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
        <Table columns={columns} data={clients} loading={loading} emptyMessage="No clients found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}