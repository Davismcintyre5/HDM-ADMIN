import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOfficeBuilding,
  HiClock,
  HiCash,
  HiDocumentText,
  HiRefresh,
  HiArrowRight,
} from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Table from '../../components/pharmasys/ui/Table';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import StatCard from '../../components/pharmasys/ui/StatCard';
import { getTenants } from '../../services/pharmasys/tenants';
import { getPendingList } from '../../services/pharmasys/pending';
import { getPaymentStats } from '../../services/pharmasys/payments';
import { relativeTime } from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import { statusVariant } from '../../utils/pharmasys/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    pendingCount: 0,
    revenueTotal: 0,
    paymentCount: 0,
  });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allTenants, activeTenants, pendingCount, pendingList, paymentStats] =
        await Promise.all([
          getTenants({ limit: 1 }),
          getTenants({ status: 'active', limit: 1 }),
          getPendingList({ limit: 1 }),
          getPendingList({ limit: 5 }),
          getPaymentStats(),
        ]);

      const allMeta = allTenants?.meta || {};
      const activeMeta = activeTenants?.meta || {};
      const pendingMeta = pendingCount?.meta || {};

      const pendingData = pendingList?.data || [];
      const payStats = paymentStats?.data || paymentStats || {};

      setStats({
        totalTenants: allMeta.total ?? 0,
        activeTenants: activeMeta.total ?? 0,
        pendingCount: pendingMeta.total ?? 0,
        revenueTotal: payStats?.totals?.amount ?? 0,
        paymentCount: payStats?.totals?.count ?? 0,
      });

      setPending(Array.isArray(pendingData) ? pendingData : []);
    } catch (err) {
      setError(err.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !stats.totalTenants && !pending.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Could not load dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">{error}</p>
        <Button
          className="mt-6"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Retry
        </Button>
      </div>
    );
  }

  const columns = [
    {
      key: 'tenant',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.tenant?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {row.tenant?.country || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">
            {row.owner?.fullName || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{row.owner?.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {(row.status || '').replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-sm text-[var(--text-muted)]">
          {relativeTime(row.registeredAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: () => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/pharmasys/pending')}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            PharmaSys platform overview
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active tenants"
          value={stats.activeTenants}
          hint={`${stats.totalTenants} total`}
          icon={HiOfficeBuilding}
          color="text-rose-500"
        />
        <StatCard
          label="Pending approvals"
          value={stats.pendingCount}
          hint="Awaiting review"
          icon={HiClock}
          color="text-amber-500"
        />
        <StatCard
          label="Payments"
          value={stats.paymentCount}
          hint="All time"
          icon={HiDocumentText}
          color="text-blue-500"
        />
        <StatCard
          label="Revenue"
          value={formatMoneyMajor(stats.revenueTotal, 'KES')}
          hint="All time"
          icon={HiCash}
          color="text-green-500"
        />
      </div>

      <Card
        title="Pending approvals"
        description="Latest registrations awaiting review"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/pharmasys/pending')}
            icon={<HiArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        }
        padding={false}
      >
        <div className="p-4">
          <Table
            columns={columns}
            data={pending}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No pending approvals"
          />
        </div>
      </Card>

      <Card title="Quick actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Tenants', path: '/pharmasys/tenants' },
            { label: 'Pending', path: '/pharmasys/pending' },
            { label: 'Payments', path: '/pharmasys/payments' },
            { label: 'Invoices', path: '/pharmasys/invoices' },
            { label: 'Plans', path: '/pharmasys/plans' },
            { label: 'Backups', path: '/pharmasys/backups' },
            { label: 'Audit Logs', path: '/pharmasys/audit-logs' },
            { label: 'Health', path: '/pharmasys/health' },
          ].map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--sidebar-hover)] text-sm text-[var(--text-primary)] transition-colors group"
              type="button"
            >
              {link.label}
              <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}