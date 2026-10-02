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

function StatBox({ label, value, tone }) {
  const toneClass =
    tone === 'success' ? 'text-green-600' :
    tone === 'danger' ? 'text-red-600' :
    tone === 'warning' ? 'text-yellow-600' :
    'text-[var(--text-primary)]';
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className={`text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function UsageBar({ current, limit, label }) {
  const pct = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-indigo-600';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)] font-medium">
          {Number(current || 0).toLocaleString()} / {Number(limit || 0).toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.max(pct, 0.5)}%` }} />
      </div>
    </div>
  );
}

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [recentOrgs, setRecentOrgs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, org: null, subscription: null, usage: null, counts: null, loading: false });
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
    setViewModal({ open: true, org: null, subscription: null, usage: null, counts: null, loading: true });
    try {
      const res = await getOrganization(orgId);
      setViewModal({
        open: true,
        org: res.organization || res.data?.organization || res.data || res,
        subscription: res.subscription || null,
        usage: res.usage || null,
        counts: res.counts || null,
        loading: false,
      });
    } catch (err) { alert(err.message); setViewModal({ open: false, org: null, subscription: null, usage: null, counts: null, loading: false }); }
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

  const vm = viewModal;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Organizations</h1>

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

      <Modal open={vm.open} onClose={() => setViewModal({ open: false, org: null, subscription: null, usage: null, counts: null, loading: false })} title="Organization Details" size="lg">
        {vm.loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : vm.org ? (
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <HiOfficeBuilding className="w-6 h-6 text-indigo-500" />
                <h3 className="font-semibold text-lg text-[var(--text-primary)]">{vm.org.name}</h3>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{vm.org.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Created:</span><span className="text-[var(--text-primary)]">{formatDate(vm.org.createdAt, 'full')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Users:</span><span className="text-[var(--text-primary)]">{vm.org.userCount || vm.org.users?.length || 0}</span></div>
            </div>

            {vm.subscription ? (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">Plan</h3>
                  <Badge variant={vm.subscription.status === 'active' ? 'success' : 'warning'}>{vm.subscription.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{vm.subscription.name}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Tier:</span><Badge variant="indigo">{vm.subscription.tier}</Badge></div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Price:</span>
                    <span className="text-[var(--text-primary)]">{vm.subscription.price?.currency} {vm.subscription.price?.amount} / {vm.subscription.price?.interval}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Renews:</span><span className="text-[var(--text-primary)]">{formatDate(vm.subscription.currentPeriodEnd)} ({vm.subscription.daysLeft}d)</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Plan</h3>
                <p className="text-[var(--text-muted)]">No active subscription.</p>
              </div>
            )}

            {vm.usage && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm space-y-3">
                <h3 className="font-semibold text-[var(--text-primary)]">Usage</h3>
                <UsageBar label="Daily Emails" current={vm.usage.dailyEmails?.current} limit={vm.usage.dailyEmails?.limit} />
                <UsageBar label="Monthly Emails" current={vm.usage.monthlyEmails?.current} limit={vm.usage.monthlyEmails?.limit} />
                {vm.usage.dailySms?.limit > 0 && (
                  <UsageBar label="Daily SMS" current={vm.usage.dailySms?.current} limit={vm.usage.dailySms?.limit} />
                )}
                {vm.usage.monthlySms?.limit > 0 && (
                  <UsageBar label="Monthly SMS" current={vm.usage.monthlySms?.current} limit={vm.usage.monthlySms?.limit} />
                )}
              </div>
            )}

            {vm.counts && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Counts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatBox label="Total Emails" value={Number(vm.counts.emails?.total || 0).toLocaleString()} />
                  <StatBox label="Delivered" value={Number(vm.counts.emails?.delivered || 0).toLocaleString()} tone="success" />
                  <StatBox label="Failed" value={Number(vm.counts.emails?.failed || 0).toLocaleString()} tone="danger" />
                  <StatBox label="Bounced" value={Number(vm.counts.emails?.bounced || 0).toLocaleString()} tone="warning" />
                  <StatBox label="API Keys" value={vm.counts.apiKeys || 0} />
                  <StatBox label="Domains" value={`${vm.counts.verifiedDomains || 0}/${vm.counts.domains || 0}`} />
                  <StatBox label="Senders" value={vm.counts.senders || 0} />
                  <StatBox label="Templates" value={vm.counts.templates || 0} />
                </div>
              </div>
            )}

            {vm.org.users?.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Users ({vm.org.users.length})</h3>
                <div className="space-y-2">
                  {vm.org.users.map((user, i) => (
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
              <Button variant="danger" onClick={() => { setViewModal({ open: false, org: null, subscription: null, usage: null, counts: null, loading: false }); setConfirmDelete({ open: true, org: vm.org }); }}>
                <HiTrash className="w-4 h-4 mr-1" /> Delete Organization
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Organization not found.</p>
        )}
      </Modal>

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