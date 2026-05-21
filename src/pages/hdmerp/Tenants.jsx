import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTenants, suspendTenant, deleteTenant } from '../../services/hdmerp/tenants';
import Card from '../../components/hdmerp/ui/Card';
import Table from '../../components/hdmerp/ui/Table';
import SearchBar from '../../components/hdmerp/ui/SearchBar';
import Badge from '../../components/hdmerp/ui/Badge';
import Button from '../../components/hdmerp/ui/Button';
import ConfirmDialog from '../../components/hdmerp/ui/ConfirmDialog';
import Pagination from '../../components/hdmerp/ui/Pagination';
import { formatDate } from '../../utils/hdmerp/formatDate';

export default function Tenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTenants = () => {
    setLoading(true);
    getTenants()
      .then(setTenants)
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenants(); }, []);

  const filtered = tenants.filter(t =>
    t.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    t.contactEmail?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendTenant(confirm.id);
      else await deleteTenant(confirm.id);
      fetchTenants();
    } catch (err) {
      alert(err.message);
    }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '' });
  };

  const columns = [
    { key: 'companyName', label: 'Company', render: (row) => (
      <button onClick={() => navigate(`/hdmerp/tenants/${row._id}`)} className="text-green-600 hover:underline font-medium">
        {row.companyName || 'N/A'}
      </button>
    )},
    { key: 'plan', label: 'Plan', render: (row) => <Badge variant="info">{row.plan}</Badge> },
    { key: 'status', label: 'Status', render: (row) => {
      const variants = { active: 'success', suspended: 'warning', pending: 'default', deleted: 'danger' };
      return <Badge variant={variants[row.status] || 'default'}>{row.status}</Badge>;
    }},
    { key: 'contactEmail', label: 'Email' },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/hdmerp/tenants/${row._id}`)}>View</Button>
        {row.status === 'active' && (
          <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend' })}>Suspend</Button>
        )}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete' })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tenants</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search tenants..." />
      </div>
      <Card>
        <Table columns={columns} data={paged} loading={loading} emptyMessage="No tenants found." />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'suspend' ? 'Suspend Tenant' : 'Delete Tenant'}
        message={confirm.type === 'suspend' ? 'Are you sure you want to suspend this tenant?' : 'This action is irreversible. Delete permanently?'}
        confirmLabel={confirm.type === 'suspend' ? 'Suspend' : 'Delete'}
        variant={confirm.type === 'suspend' ? 'warning' : 'danger'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}