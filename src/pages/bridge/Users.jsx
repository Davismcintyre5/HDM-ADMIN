import { useState, useEffect } from 'react';
import { getUsers, getUser, suspendUser, activateUser, deleteUser } from '../../services/bridge/users';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import SearchBar from '../../components/bridge/ui/SearchBar';
import Pagination from '../../components/bridge/ui/Pagination';
import ConfirmDialog from '../../components/bridge/ui/ConfirmDialog';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiBan, HiCheck, HiTrash, HiEye } from 'react-icons/hi';

function SubBadge({ subscription }) {
  if (!subscription) return null;

  if (subscription.isFree) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
        Free
      </span>
    );
  }

  const d = subscription.daysLeft;

  if (subscription.status === 'frozen') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        Frozen
      </span>
    );
  }

  if (d === null || d === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
        {subscription.planName}
      </span>
    );
  }

  let cls = 'bg-green-100 text-green-700';
  let label = `${d}d left`;

  if (d <= 3) {
    cls = 'bg-red-100 text-red-700';
  } else if (d <= 7) {
    cls = 'bg-yellow-100 text-yellow-700';
  } else if (d <= 14) {
    cls = 'bg-blue-100 text-blue-700';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {subscription.planName} · {label}
    </span>
  );
}

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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState({ open: false, user: null, subscription: null, usage: null, counts: null, recentEmails: [], recentTransactions: [] });
  const [viewLoading, setViewLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ page, limit: 20, search })
      .then((res) => {
        setUsers(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleView = async (userId) => {
    setViewLoading(true);
    setViewModal({ open: true, user: null, subscription: null, usage: null, counts: null, recentEmails: [], recentTransactions: [] });
    try {
      const res = await getUser(userId);
      setViewModal({
        open: true,
        user: res.user || res.data?.user || res.data || res,
        subscription: res.subscription || null,
        usage: res.usage || null,
        counts: res.counts || null,
        recentEmails: res.recentEmails || [],
        recentTransactions: res.recentTransactions || [],
      });
    } catch (err) { alert(err.message); }
    setViewLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(confirm.id);
      else if (confirm.type === 'activate') await activateUser(confirm.id);
      else if (confirm.type === 'delete') await deleteUser(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleView(row._id || row.id)}
            className="text-indigo-600 hover:underline font-medium text-left"
          >
            {row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'N/A'}
          </button>
          {row.subscription && (
            <SubBadge subscription={row.subscription} />
          )}
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant="indigo">{row.role || 'user'}</Badge> },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => handleView(row._id || row.id)}>
            <HiEye className="w-4 h-4" />
          </Button>
          {row.isActive ? (
            <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'suspend' })}>
              <HiBan className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'activate' })}>
              <HiCheck className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id || row.id, type: 'delete' })}>
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const vm = viewModal;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
          <p className="text-xs text-[var(--text-muted)]">{pagination.total || users.length} users</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
      </Card>

      <Modal
        open={vm.open}
        onClose={() => setViewModal({ open: false, user: null, subscription: null, usage: null, counts: null, recentEmails: [], recentTransactions: [] })}
        title="User Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : vm.user ? (
          <div className="space-y-4">

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">Profile</h3>
                {vm.subscription && <SubBadge subscription={vm.subscription} />}
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{vm.user.fullName || `${vm.user.firstName || ''} ${vm.user.lastName || ''}`.trim() || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{vm.user.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{vm.user.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Role:</span><Badge variant="indigo">{vm.user.role || 'user'}</Badge></div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Status:</span>
                <Badge variant={vm.user.isActive ? 'success' : 'danger'}>{vm.user.isActive ? 'Active' : 'Suspended'}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Currency:</span><span className="text-[var(--text-primary)]">{vm.user.preferredCurrency || 'USD'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">2FA:</span><span className="text-[var(--text-primary)]">{vm.user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email Verified:</span><Badge variant={vm.user.isEmailVerified ? 'success' : 'warning'}>{vm.user.isEmailVerified ? 'Yes' : 'No'}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Timezone:</span><span className="text-[var(--text-primary)]">{vm.user.timezone || 'UTC'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Last Login:</span><span className="text-[var(--text-primary)]">{formatDate(vm.user.lastLogin, 'full')}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Joined:</span><span className="text-[var(--text-primary)]">{formatDate(vm.user.createdAt, 'full')}</span></div>
            </div>

            {vm.user.organizationId && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Organization</h3>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)]">{vm.user.organizationId.name}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{vm.user.organizationId.email}</span></div>
              </div>
            )}

            {vm.subscription ? (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">Plan</h3>
                  <Badge variant={
                    vm.subscription.isFree ? 'default' :
                    vm.subscription.status === 'frozen' ? 'danger' :
                    vm.subscription.status === 'active' ? 'success' :
                    'warning'
                  }>
                    {vm.subscription.isFree ? 'Free' : vm.subscription.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{vm.subscription.name}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Tier:</span><Badge variant="indigo">{vm.subscription.tier}</Badge></div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Price:</span>
                    <span className="text-[var(--text-primary)]">
                      {vm.subscription.price?.currency} {vm.subscription.price?.amount} / {vm.subscription.price?.interval}
                    </span>
                  </div>
                  {!vm.subscription.isFree && (
                    <>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Payment Method:</span><span className="text-[var(--text-primary)] capitalize">{vm.subscription.paymentMethod || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Period Start:</span><span className="text-[var(--text-primary)]">{formatDate(vm.subscription.currentPeriodStart)}</span></div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Renews:</span>
                        <span className={vm.subscription.daysLeft <= 7 ? 'text-red-600 font-medium' : 'text-[var(--text-primary)]'}>
                          {formatDate(vm.subscription.currentPeriodEnd)}
                          {vm.subscription.daysLeft !== null && ` (${vm.subscription.daysLeft}d left)`}
                        </span>
                      </div>
                      {vm.subscription.status === 'frozen' && vm.subscription.frozenAt && (
                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Frozen:</span><span className="text-red-600">{formatDate(vm.subscription.frozenAt, 'full')}</span></div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Plan</h3>
                <p className="text-[var(--text-muted)]">Free tier</p>
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

            {vm.recentEmails?.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Recent Emails</h3>
                <div className="space-y-2">
                  {vm.recentEmails.map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[var(--text-primary)] truncate">{e.subject || 'No subject'}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{e.to?.email || e.to || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={
                          e.status === 'delivered' || e.status === 'sent' || e.status === 'opened' || e.status === 'clicked' ? 'success' :
                          e.status === 'failed' || e.status === 'bounced' ? 'danger' :
                          'default'
                        }>{e.status}</Badge>
                        <span className="text-xs text-[var(--text-muted)]">{formatDate(e.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vm.recentTransactions?.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Recent Transactions</h3>
                <div className="space-y-2">
                  {vm.recentTransactions.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[var(--text-primary)] truncate">{t.description || t.invoiceNumber || 'Payment'}</p>
                        <p className="text-xs text-[var(--text-muted)]">{t.invoiceNumber || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[var(--text-primary)] font-medium">{t.currency} {Number(t.amount || 0).toLocaleString()}</span>
                        <Badge variant={t.status === 'completed' ? 'success' : t.status === 'failed' ? 'danger' : 'default'}>{t.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vm.user.notificationPreferences && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Notifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(vm.user.notificationPreferences).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Badge variant={val ? 'success' : 'default'}>{val ? 'ON' : 'OFF'}</Badge>
                      <span className="text-xs text-[var(--text-secondary)]">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">User not found.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'suspend' ? 'Suspend User' : confirm.type === 'activate' ? 'Activate User' : 'Delete User'}
        message={confirm.type === 'delete' ? 'Permanently delete this user?' : `${confirm.type} this user?`}
        confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Confirm'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'}
        onConfirm={handleAction} loading={actionLoading}
      />
    </div>
  );
}