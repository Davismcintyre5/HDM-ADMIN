import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/bizhub/analytics';
import Card from '../../components/bizhub/ui/Card';
import Spinner from '../../components/bizhub/ui/Spinner';
import { HiOfficeBuilding, HiCash, HiUsers, HiSupport } from 'react-icons/hi';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res?.data || res))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const t = data?.tenants || {};
  const r = data?.revenue || {};
  const s = data?.subscriptions || {};
  const sp = data?.support || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Tenants</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{t.total || 0}</p>
            </div>
            <HiOfficeBuilding className="w-8 h-8 text-teal-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Revenue</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">KES {(r.total || 0).toLocaleString()}</p>
            </div>
            <HiCash className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active Subs</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{s.total || 0}</p>
            </div>
            <HiUsers className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Open Tickets</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{sp.openTickets || 0}</p>
            </div>
            <HiSupport className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Tenants</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total:</span><span className="text-[var(--text-primary)] font-medium">{t.total || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Active:</span><span className="text-green-600 font-medium">{t.active || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Trial:</span><span className="text-blue-600 font-medium">{t.trial || 0}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Pending:</span><span className="text-yellow-600 font-medium">{t.pending || 0}</span></div>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Revenue</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Total:</span><span className="text-[var(--text-primary)] font-medium">KES {(r.total || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">This Month:</span><span className="text-green-600 font-medium">KES {(r.thisMonth || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Last Month:</span><span className="text-[var(--text-muted)]">KES {(r.lastMonth || 0).toLocaleString()}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}