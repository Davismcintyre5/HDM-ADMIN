import { useEffect, useState } from 'react';
import { getOrganizations, getOrganization, deleteOrganization, getOrgActivity } from '../../services/bridge/organizations';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import SearchBar from '../../components/bridge/ui/SearchBar';
import Pagination from '../../components/bridge/ui/Pagination';
import ConfirmDialog from '../../components/bridge/ui/ConfirmDialog';
import Spinner from '../../components/bridge/ui/Spinner';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiEye, HiTrash, HiOfficeBuilding, HiUsers } from 'react-icons/hi';

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [recentOrgs, setRecentOrgs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, org: null, loading: false });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, org: null });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getOrganizations({ page, limit: 20, search }), getOrgActivity(4)])
      .then(([o, r]) => {
        setOrgs(o.data || []);
        setPagination(o.pagination || { page: 1, pages: 1 });
        setRecentOrgs(r.data || r || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleView = async (orgId) => {
    setViewModal({ open: true, org: null, loading: true });
    try {
      const res = await getOrganization(orgId);
      setViewModal({ open: true, org: res.organization || res.data || res, loading: false });
    } catch (err) { alert(err.message); setViewModal({ open: false, org: null, loading: false }); }
  };

  const handleDelete = async () => {
    try {
      await deleteOrganization(confirmDelete.org._id || confirmDelete.org.id);
      setConfirmDelete({ open: false, org: null });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <button onClick={() => handleView(row._id || row.id)} className="text-indigo-600 hover:underline font-medium">
        {row.name}
      </button>
    )},
    { key: 'email', label: 'Email' },
    { key: 'users', label: 'Users', render: (row) => (
      <span className="text-sm">{row.userCount || row.users?.length || 0}</span>
    )},
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => handleView(row._id || row.id)}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, org: row })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Organizations</h1>

      {/* Recent Org Cards */}
      {recentOrgs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {recentOrgs.map(org => (
            <Card key={org._id || org.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleView(org._id || org.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOfficeBuilding className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-[var(--text-primary)]">{org.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <HiUsers className="w-3.5 h-3.5" />
                    <span>{org.userCount || org.users?.length || 0} users</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Owner: {org.ownerName || org.owner?.fullName || org.owner?.firstName || '—'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(org.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search organizations..." />
      </div>

      <Card>
        <Table columns={columns} data={orgs} loading={loading} emptyMessage="No organizations found." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, org: null, loading: false })} title="Organization Details" size="lg">
        {viewModal.loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : viewModal.org ? (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <HiOfficeBuilding className="w-6 h-6 text-indigo-500" />
                <h3 className="font-semibold text-lg text-[var(--text-primary)]">{viewModal.org.name}</h3>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.org.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Created:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.org.createdAt, 'full')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Users:</span><span className="text-[var(--text-primary)]">{viewModal.org.userCount || viewModal.org.users?.length || 0}</span></div>
            </div>

            {/* Users List */}
            {viewModal.org.users?.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Users ({viewModal.org.users.length})</h3>
                <div className="space-y-2">
                  {viewModal.org.users.map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo">{user.role}</Badge>
                        <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="danger" onClick={() => { setViewModal({ open: false, org: null, loading: false }); setConfirmDelete({ open: true, org: viewModal.org }); }}>
                <HiTrash className="w-4 h-4 mr-1" /> Delete Organization
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Organization not found.</p>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, org: null })}
        title="Delete Organization"
        message={`Delete "${confirmDelete.org?.name}" and ALL associated data?\n\nThis will permanently delete:\n• All users\n• All API keys, domains, templates\n• All email logs and transactions\n\nThis action CANNOT be undone.`}
        confirmLabel="Delete Everything"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}