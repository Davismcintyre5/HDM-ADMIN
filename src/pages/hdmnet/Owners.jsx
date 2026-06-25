import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwners, approveOwner, suspendOwner, deleteOwner } from '../../services/hdmnet/owners';
import Card from '../../components/hdmnet/ui/Card';
import Table from '../../components/hdmnet/ui/Table';
import SearchBar from '../../components/hdmnet/ui/SearchBar';
import Badge from '../../components/hdmnet/ui/Badge';
import Button from '../../components/hdmnet/ui/Button';
import Pagination from '../../components/hdmnet/ui/Pagination';
import ConfirmDialog from '../../components/hdmnet/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmnet/formatDate';
import { HiEye, HiCheck, HiX, HiTrash } from 'react-icons/hi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

export default function Owners() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });

  const fetchOwners = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    getOwners(params)
      .then((res) => {
        const data = res?.data || res || [];
        setOwners(Array.isArray(data) ? data : data.data || []);
        setTotalPages(data.pages || res?.pagination?.pages || Math.ceil((data.total || data.length) / 20) || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOwners(); }, [page, filter, search]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try { await approveOwner(id, true); fetchOwners(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleSuspend = async (id) => {
    setActionLoading(true);
    try { await suspendOwner(id); fetchOwners(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteOwner(confirm.id);
      fetchOwners();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '' });
  };

  const statusVariants = { active: 'success', pending: 'warning', suspended: 'danger' };

  const columns = [
    {
      key: 'business_name',
      label: 'Business',
      render: (row) => (
        <button
          onClick={() => navigate(`/hdmnet/owners/${row.id}`)}
          className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
        >
          {row.business_name || 'N/A'}
        </button>
      ),
    },
    { key: 'business_email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={statusVariants[row.status] || 'default'}>{row.status}</Badge>,
    },
    {
      key: 'created_at',
      label: 'Registered',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/hdmnet/owners/${row.id}`)}>
            <HiEye className="w-4 h-4 mr-1" /> View
          </Button>
          {row.status === 'pending' && (
            <Button size="sm" variant="success" onClick={() => handleApprove(row.id)} loading={actionLoading}>
              <HiCheck className="w-4 h-4" /> Approve
            </Button>
          )}
          {row.status === 'active' && (
            <Button size="sm" variant="warning" onClick={() => handleSuspend(row.id)} loading={actionLoading}>
              <HiX className="w-4 h-4" /> Suspend
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirm({ open: true, id: row.id, type: 'delete' })}
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Owners</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search owners..." />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {FILTERS.map((f) => (
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
        <Table columns={columns} data={owners} loading={loading} emptyMessage="No owners found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={confirm.open && confirm.type === 'delete'}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        onConfirm={handleDelete}
        title="Delete Owner"
        message="This action is irreversible. Permanently delete this owner and all their data?"
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}