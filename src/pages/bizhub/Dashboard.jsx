import { useEffect, useState } from 'react';
import { getTenantStats } from '../../services/bizhub/tenants';
import { getPaymentStats } from '../../services/bizhub/payments';
import { getTicketStats } from '../../services/bizhub/support';
import Card from '../../components/bizhub/ui/Card';
import Spinner from '../../components/bizhub/ui/Spinner';
import { HiOfficeBuilding, HiCash, HiClock, HiSupport } from 'react-icons/hi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTenantStats().catch(() => ({})),
      getPaymentStats().catch(() => ({})),
      getTicketStats().catch(() => ({})),
    ]).then(([t, p, s]) => {
      setStats({
        tenants: t?.data || t || {},
        payments: p?.data || p || {},
        tickets: s?.data || s || {},
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">BizHub platform overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Tenants</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats.tenants.total || 0}</p>
            </div>
            <HiOfficeBuilding className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active Tenants</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats.tenants.active || 0}</p>
            </div>
            <HiOfficeBuilding className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Revenue</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">KES {(stats.payments.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <HiCash className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Open Tickets</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stats.tickets.open || 0}</p>
            </div>
            <HiSupport className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Tenants</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total:</span><span className="text-[var(--text-primary)]">{stats.tenants.total || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Active:</span><span className="text-green-600">{stats.tenants.active || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Trial:</span><span className="text-blue-600">{stats.tenants.trial || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Suspended:</span><span className="text-red-600">{stats.tenants.suspended || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Pending:</span><span className="text-yellow-600">{stats.tenants.pending || 0}</span></div>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Revenue</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total:</span><span className="text-[var(--text-primary)]">KES {(stats.payments.totalRevenue || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">This Month:</span><span className="text-[var(--text-primary)]">KES {(stats.payments.monthlyRevenue || 0).toLocaleString()}</span></div>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Support</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Open:</span><span className="text-yellow-600">{stats.tickets.open || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">In Progress:</span><span className="text-blue-600">{stats.tickets.inProgress || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Resolved:</span><span className="text-green-600">{stats.tickets.resolved || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Urgent:</span><span className="text-red-600">{stats.tickets.urgent || 0}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}