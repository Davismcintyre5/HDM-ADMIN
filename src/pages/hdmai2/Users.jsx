import { useState, useEffect } from 'react';
import { getUsers, suspendUser, banUser, deleteUser, restoreUser } from '../../services/hdmai2/users';
import { getUsageByPlan, getTopUsers, getDailyUsage } from '../../services/hdmai2/usage';
import Card from '../../components/hdmai2/ui/Card';
import Table from '../../components/hdmai2/ui/Table';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Input from '../../components/hdmai2/ui/Input';
import Modal from '../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../utils/hdmai2/formatDate';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'usage', label: 'Usage' },
];

const statusVariant = { active: 'success', suspended: 'warning', banned: 'danger', deleted: 'default' };

export default function Users() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendModal, setSuspendModal] = useState({ open: false, user: null });
  const [suspendForm, setSuspendForm] = useState({ reason: '', duration: '' });
  const [banModal, setBanModal] = useState({ open: false, user: null });
  const [banReason, setBanReason] = useState('');
  const [confirmAction, setConfirmAction] = useState({ open: false, id: null, name: '', action: '' });

  const [usageDays, setUsageDays] = useState(30);
  const [planUsage, setPlanUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => setUsers(res?.data?.users || res?.data || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  const fetchUsage = () => {
    setLoading(true);
    Promise.all([getUsageByPlan(usageDays), getTopUsers(usageDays), getDailyUsage(usageDays)])
      .then(([plan, top, daily]) => {
        setPlanUsage(plan?.data?.planUsage || []);
        setTopUsers(top?.data?.topUsers || []);
        setDailyUsage(daily?.data?.chart || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    activeTab === 'usage' ? fetchUsage() : fetchUsers();
  }, [activeTab, usageDays]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try { await suspendUser(suspendModal.user._id, suspendForm); setSuspendModal({ open: false, user: null }); fetchUsers(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleBan = async () => {
    setActionLoading(true);
    try { await banUser(banModal.user._id, { reason: banReason }); setBanModal({ open: false, user: null }); fetchUsers(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirmAction.action === 'delete') await deleteUser(confirmAction.id);
      else if (confirmAction.action === 'restore') await restoreUser(confirmAction.id);
      setConfirmAction({ open: false, id: null, name: '', action: '' }); fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const getDisplayName = (row) => row.userId?.name || row.name || '—';
  const getDisplayEmail = (row) => row.userId?.email || row.email || '—';

  const columns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium">{getDisplayName(row)}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{getDisplayEmail(row)}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'totalPredictions', label: 'Predictions', render: row => <span className="text-sm">{row.totalPredictions ?? '—'}</span> },
    { key: 'lastActive', label: 'Last Active', render: row => formatDate(row.lastActive || row.updatedAt) },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.userId?.createdAt || row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        {row.status === 'active' && (
          <>
            <Button size="sm" variant="warning" onClick={() => { setSuspendForm({ reason: '', duration: '' }); setSuspendModal({ open: true, user: row }); }}>Suspend</Button>
            <Button size="sm" variant="danger" onClick={() => { setBanReason(''); setBanModal({ open: true, user: row }); }}>Ban</Button>
          </>
        )}
        {row.status !== 'deleted' && (
          <Button size="sm" variant="danger" onClick={() => setConfirmAction({ open: true, id: row._id, name: getDisplayName(row), action: 'delete' })}>Delete</Button>
        )}
        {(row.status === 'suspended' || row.status === 'banned' || row.status === 'deleted') && (
          <Button size="sm" variant="success" onClick={() => setConfirmAction({ open: true, id: row._id, name: getDisplayName(row), action: 'restore' })}>Restore</Button>
        )}
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Users</h1>
          <Card>
            <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />
          </Card>
        </>
      )}

      {activeTab === 'usage' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Usage</h1>
            <select value={usageDays} onChange={e => setUsageDays(+e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
            </select>
          </div>

          <Card className="mb-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Requests by Plan</h2>
            {planUsage.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No usage data.</p>
            ) : (
              <div className="space-y-3">
                {planUsage.map((plan, i) => {
                  const maxRequests = Math.max(...planUsage.map(p => p.totalRequests || 0), 1);
                  const pct = ((plan.totalRequests || 0) / maxRequests) * 100;
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--text-primary)] capitalize">{plan.plan || plan.name || 'Unknown'}</span>
                        <span className="text-[var(--text-muted)]">{plan.totalRequests?.toLocaleString() || 0} requests ({plan.users || 0} users)</span>
                      </div>
                      <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-4">
                        <div className={`h-4 rounded-full transition-all ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="mb-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Daily Usage</h2>
            {dailyUsage.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No daily data.</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {dailyUsage.map((day, i) => {
                  const maxVal = Math.max(...dailyUsage.map(d => d.requests || 0), 1);
                  const h = ((day.requests || 0) / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${day.date}: ${day.requests || 0} requests`}>
                      <div className="w-full bg-blue-500 rounded-t" style={{ height: `${h}%`, minHeight: day.requests > 0 ? '4px' : '0' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Top Users</h2>
            {topUsers.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No user data.</p>
            ) : (
              <div className="space-y-2">
                {topUsers.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[var(--text-muted)] w-6">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{user.email || user.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[var(--text-primary)]">{user.total?.toLocaleString()} requests</span>
                      {user.avgTime != null && <span className="text-[var(--text-muted)]">{user.avgTime}ms avg</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal open={suspendModal.open} onClose={() => setSuspendModal({ open: false, user: null })} title={`Suspend ${getDisplayName(suspendModal.user || {})}`}>
        <div className="space-y-4">
          <Input label="Reason" value={suspendForm.reason} onChange={e => setSuspendForm({ ...suspendForm, reason: e.target.value })} placeholder="Reason for suspension" />
          <Input label="Duration (days, empty = permanent)" type="number" value={suspendForm.duration} onChange={e => setSuspendForm({ ...suspendForm, duration: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSuspendModal({ open: false, user: null })}>Cancel</Button>
            <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Suspend</Button>
          </div>
        </div>
      </Modal>

      <Modal open={banModal.open} onClose={() => setBanModal({ open: false, user: null })} title={`Ban ${getDisplayName(banModal.user || {})}`}>
        <div className="space-y-4">
          <Input label="Reason" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban" required />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setBanModal({ open: false, user: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleBan} loading={actionLoading}>Ban</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmAction.open} onClose={() => setConfirmAction({ open: false, id: null, name: '', action: '' })} onConfirm={handleAction}
        title={confirmAction.action === 'delete' ? 'Delete User' : 'Restore User'}
        message={confirmAction.action === 'delete' ? `Delete ${confirmAction.name}?` : `Restore ${confirmAction.name}?`}
        confirmLabel={confirmAction.action === 'delete' ? 'Delete' : 'Restore'}
        variant={confirmAction.action === 'delete' ? 'danger' : 'success'} loading={actionLoading} />
    </div>
  );
}