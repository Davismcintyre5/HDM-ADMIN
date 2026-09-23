import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers,
  HiClock,
  HiUserGroup,
  HiSparkles,
  HiRefresh,
  HiArrowRight,
} from 'react-icons/hi';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import StatCard from '../../components/smartpos/ui/StatCard';
import { getOverview } from '../../services/smartpos/dashboard';
import { getPendingList } from '../../services/smartpos/pending';
import { relativeTime } from '../../utils/smartpos/formatDate';
import { statusVariant } from '../../utils/smartpos/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, p] = await Promise.all([
        getOverview(),
        getPendingList({ page: 1, limit: 5 }),
      ]);
      setOverview(o?.data || o);
      const pendingRes = p?.data || p;
      setPending(pendingRes?.data || pendingRes || []);
    } catch (err) {
      setError(err.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !overview) {
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

  const d = overview || {};
  const tenants = d.tenants || {};

  const columns = [
    {
      key: 'tenant',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.tenant?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)] capitalize">
            {row.tenant?.businessType}
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
          {row.status}
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
        <Button size="sm" variant="ghost" onClick={() => navigate('/smartpos/pending')}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Platform overview</p>
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
          label="Total clients"
          value={tenants.total ?? 0}
          hint={`${tenants.active ?? 0} active`}
          icon={HiUsers}
          color="text-blue-500"
        />
        <StatCard
          label="Pending approvals"
          value={d.pendingQueue ?? 0}
          hint="Awaiting review"
          icon={HiClock}
          color="text-amber-500"
        />
        <StatCard
          label="Total users"
          value={d.users ?? 0}
          hint="Active accounts"
          icon={HiUserGroup}
          color="text-green-500"
        />
        <StatCard
          label="AI calls (30d)"
          value={d.aiCalls30d ?? 0}
          hint="HDM AI"
          icon={HiSparkles}
          color="text-purple-500"
        />
      </div>

      <Card
        title="Pending approvals"
        description="Latest registrations awaiting review"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/smartpos/pending')}
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
    </div>
  );
}