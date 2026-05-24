import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, suspendClient, activateClient, deleteClient } from '../../services/smartpos/clients';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import SearchBar from '../../components/smartpos/ui/SearchBar';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import ConfirmDialog from '../../components/smartpos/ui/ConfirmDialog';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';

export default function Clients() {
  const navigate = useNavigate();
  const [data, setData] = useState({ clients: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClients = () => {
    setLoading(true);
    getClients({ search, page, limit: perPage })
      .then(res => setData({ clients: res.clients || [], count: res.count || 0 }))
      .catch(err => console.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [page, search]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendClient(confirm.id);
      else if (confirm.type === 'activate') await activateClient(confirm.id);
      else await deleteClient(confirm.id);
      fetchClients();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '' });
  };

  const statusVariant = { active: 'success', inactive: 'default', suspended: 'danger' };

  const columns = [
    { key: 'businessName', label: 'Business', render: (row) => (
      <button onClick={() => navigate(`/smartpos/clients/${row._id}`)} className="text-blue-600 hover:underline font-medium">{row.businessName || 'N/A'}</button>
    )},
    { key: 'ownerName', label: 'Owner' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || 'N/A' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'plan', label: 'Plan', render: (row) => <Badge variant="blue">{row.plan || 'N/A'}</Badge> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/smartpos/clients/${row._id}`)}>View</Button>
        {row.status === 'active' && <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend' })}>Suspend</Button>}
        {row.status === 'suspended' && <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'activate' })}>Activate</Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete' })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clients</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search clients..." />
      </div>
      <Card>
        <Table columns={columns} data={data.clients} loading={loading} emptyMessage="No clients found." />
        <Pagination page={page} totalPages={Math.ceil(data.count / perPage)} onPageChange={setPage} />
      </Card>
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'suspend' ? 'Suspend Client' : confirm.type === 'activate' ? 'Activate Client' : 'Delete Client'}
        message={confirm.type === 'delete' ? 'Permanently delete this client?' : `Are you sure you want to ${confirm.type} this client?`}
        confirmLabel={confirm.type === 'suspend' ? 'Suspend' : confirm.type === 'activate' ? 'Activate' : 'Delete'}
        variant={confirm.type === 'delete' ? 'danger' : 'warning'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}