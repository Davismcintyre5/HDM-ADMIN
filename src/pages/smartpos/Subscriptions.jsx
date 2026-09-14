import { useState, useEffect } from 'react';
import { getSubscriptions, getRenewals, extendSubscription, renewSubscription, suspendSubscription, expireSubscription } from '../../services/smartpos/subscriptions';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Input from '../../components/smartpos/ui/Input';
import Modal from '../../components/smartpos/ui/Modal';
import Pagination from '../../components/smartpos/ui/Pagination';
import { formatDate } from '../../utils/smartpos/formatDate';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'renewals', label: 'Renewals' },
];

const statusVariant = { active: 'success', expired: 'danger', suspended: 'danger', cancelled: 'default' };

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState([]);
  const [renewals, setRenewals] = useState({ upcoming: [], grace: [], suspended: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [extendModal, setExtendModal] = useState({ open: false, id: null });
  const [extendDays, setExtendDays] = useState(30);

  const fetchData = () => {
    setLoading(true);
    if (activeTab === 'renewals') {
      getRenewals()
        .then(res => setRenewals(res?.data || { upcoming: [], grace: [], suspended: [] }))
        .catch(console.error).finally(() => setLoading(false));
    } else {
      getSubscriptions({ page, limit: 20 })
        .then(res => {
          setItems(res?.data || []);
          setPagination(res?.meta || { page: 1, pages: 1 });
        })
        .catch(console.error).finally(() => setLoading(false));
    }
  };

  useEffect(() => { fetchData(); }, [page, activeTab]);

  const handleExtend = async () => {
    setActionLoading(true);
    try { await extendSubscription(extendModal.id, { days: extendDays }); setExtendModal({ open: false, id: null }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRenew = async (id) => { if (!window.confirm('Force renew?')) return; setActionLoading(true); try { await renewSubscription(id); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleSuspend = async (id) => { if (!window.confirm('Suspend this subscription?')) return; setActionLoading(true); try { await suspendSubscription(id); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleExpire = async (id) => { if (!window.confirm('Force into renewal state?')) return; setActionLoading(true); try { await expireSubscription(id); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  const columns = [
    { key: 'client', label: 'Client', render: row => <span className="text-sm font-medium">{row.clientName || row.client?.name || '—'}</span> },
    { key: 'plan', label: 'Plan', render: row => <Badge variant="info">{row.plan || '—'}</Badge> },
    { key: 'status', label: 'Status', render: row => <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge> },
    { key: 'periodEnd', label: 'Period End', render: row => row.periodEnd ? formatDate(row.periodEnd) : '—' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => { setExtendDays(30); setExtendModal({ open: true, id: row._id || row.id }); }}>Extend</Button>
        <Button size="sm" variant="success" onClick={() => handleRenew(row._id || row.id)}>Renew</Button>
        <Button size="sm" variant="warning" onClick={() => handleSuspend(row._id || row.id)}>Suspend</Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Subscriptions</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <Card>
          <Table columns={columns} data={items} loading={loading} emptyMessage="No subscriptions." />
          <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
        </Card>
      )}

      {activeTab === 'renewals' && (
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-3">Upcoming ({renewals.upcoming?.length || 0})</h2>
            <Table columns={columns} data={renewals.upcoming || []} loading={loading} emptyMessage="No upcoming renewals." />
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-3">Grace Period ({renewals.grace?.length || 0})</h2>
            <Table columns={columns} data={renewals.grace || []} loading={loading} emptyMessage="No grace period." />
          </Card>
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-3">Suspended ({renewals.suspended?.length || 0})</h2>
            <Table columns={columns} data={renewals.suspended || []} loading={loading} emptyMessage="No suspended." />
          </Card>
        </div>
      )}

      <Modal open={extendModal.open} onClose={() => setExtendModal({ open: false, id: null })} title="Extend Subscription" size="sm">
        <Input label="Days" type="number" value={extendDays} onChange={e => setExtendDays(+e.target.value)} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setExtendModal({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleExtend} loading={actionLoading}>Extend</Button>
        </div>
      </Modal>
    </div>
  );
}