import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, suspendOrganization, reactivateOrganization, deleteOrganization } from '../../../services/vault/organizations';
import Table from '../../../components/vault/ui/Table';
import SearchBar from '../../../components/vault/ui/SearchBar';
import Badge from '../../../components/vault/ui/Badge';
import Button from '../../../components/vault/ui/Button';
import ConfirmDialog from '../../../components/vault/ui/ConfirmDialog';
import Pagination from '../../../components/vault/ui/Pagination';
import { formatDate } from '../../../utils/vault/formatDate';

export default function OrganizationsList() {
  const navigate = useNavigate();
  const [data, setData] = useState({ organizations: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrgs = () => {
    setLoading(true);
    getOrganizations({ page, limit: 20, search })
      .then(res => setData({ organizations: res.organizations || [], total: res.total || 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrgs(); }, [page, search]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendOrganization(confirm.id);
      else if (confirm.type === 'reactivate') await reactivateOrganization(confirm.id);
      else if (confirm.type === 'delete') await deleteOrganization(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchOrgs();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const statusV = { active: 'success', suspended: 'danger' };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <button onClick={() => navigate(`/hdmvault/organizations/detail/${row._id}`)} className="text-orange-600 hover:underline font-medium">
        {row.name || 'N/A'}
      </button>
    )},
    { key: 'planTier', label: 'Plan', render: (row) => <Badge variant="orange">{row.planTier || 'N/A'}</Badge> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusV[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/hdmvault/organizations/detail/${row._id}`)}>View</Button>
        {row.status === 'active' && <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend' })}>Suspend</Button>}
        {row.status === 'suspended' && <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'reactivate' })}>Reactivate</Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete' })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search organizations..." />
      </div>
      <Table columns={columns} data={data.organizations} loading={loading} emptyMessage="No organizations found." />
      <Pagination page={page} totalPages={Math.ceil(data.total / 20) || 1} onPageChange={setPage} />
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'delete' ? 'Delete Organization' : confirm.type === 'suspend' ? 'Suspend Organization' : 'Reactivate Organization'}
        message={confirm.type === 'delete' ? 'Permanently delete this organization and ALL its users and data? This cannot be undone.' : `${confirm.type === 'suspend' ? 'Suspend' : 'Reactivate'} this organization?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : confirm.type === 'suspend' ? 'Suspend' : 'Reactivate'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}