import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOfficeBuilding,
  HiUserGroup,
  HiCash,
  HiClock,
  HiDocumentText,
  HiRefresh,
  HiArrowRight,
  HiCheckCircle,
  HiExclamation,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Button from '../../components/meteo/ui/Button';
import Badge from '../../components/meteo/ui/Badge';
import Spinner from '../../components/meteo/ui/Spinner';
import StatCard from '../../components/meteo/ui/StatCard';
import { getStats, getRecentActivity } from '../../services/meteo/dashboard';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';
import { formatDate, relativeTime } from '../../utils/meteo/formatDate';
import { statusVariant, statusLabel } from '../../utils/meteo/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        getStats(),
        getRecentActivity(),
      ]);
      setStats(s?.data || s);
      setActivity(a?.data || a);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !stats) {
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

  const d = stats || {};
  const recentTenants = activity?.recentTenants || [];
  const recentPayments = activity?.recentPayments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            HDM METEO platform overview
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total tenants"
          value={d.tenants ?? 0}
          hint={`${d.activeTenants ?? 0} active`}
          icon={HiOfficeBuilding}
          color="text-violet-500"
        />
        <StatCard
          label="Active tenants"
          value={d.activeTenants ?? 0}
          hint={`${d.pendingTenants ?? 0} pending`}
          icon={HiCheckCircle}
          color="text-green-500"
        />
        <StatCard
          label="Total users"
          value={d.users ?? 0}
          icon={HiUserGroup}
          color="text-blue-500"
        />
        <StatCard
          label="Overdue invoices"
          value={d.overdueInvoices ?? 0}
          hint="Needs attention"
          icon={HiExclamation}
          color={d.overdueInvoices > 0 ? 'text-red-500' : 'text-gray-500'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Revenue (total)"
          value={formatMoneyMajor(d.revenueTotal ?? 0, 'KES')}
          hint="All time"
          icon={HiCash}
          color="text-emerald-500"
        />
        <StatCard
          label="Revenue (this month)"
          value={formatMoneyMajor(d.revenueThisMonth ?? 0, 'KES')}
          hint="Current calendar month"
          icon={HiCash}
          color="text-violet-500"
        />
      </div>

      {/* Quick actions */}
      <Card title="Quick actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Pending', path: '/meteo/pending' },
            { label: 'Tenants', path: '/meteo/tenants' },
            { label: 'Invoices', path: '/meteo/invoices' },
            { label: 'Payments', path: '/meteo/payments' },
            { label: 'Plans', path: '/meteo/plans' },
            { label: 'Settings', path: '/meteo/settings' },
            { label: 'Health', path: '/meteo/health' },
            { label: 'Backups', path: '/meteo/backups' },
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

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent tenants"
          description="Latest registrations"
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/meteo/tenants')}
              icon={<HiArrowRight className="w-4 h-4" />}
            >
              View all
            </Button>
          }
          padding={false}
        >
          <div className="divide-y divide-[var(--border-color)]">
            {recentTenants.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">
                No recent tenants
              </p>
            ) : (
              recentTenants.map((t) => (
                <button
                  key={t._id}
                  onClick={() => navigate(`/meteo/tenants/${t._id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {t.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {t.slug || t._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant(t.status)} dot>
                      {statusLabel(t.status)}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {relativeTime(t.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card
          title="Recent payments"
          description="Latest transactions"
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/meteo/payments')}
              icon={<HiArrowRight className="w-4 h-4" />}
            >
              View all
            </Button>
          }
          padding={false}
        >
          <div className="divide-y divide-[var(--border-color)]">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">
                No recent payments
              </p>
            ) : (
              recentPayments.map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(`/meteo/payments/${p._id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {formatMoneyMajor(p.amount, p.currency || 'KES')}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-mono truncate">
                      {p.reference || p._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="success" dot>
                      Paid
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {relativeTime(p.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}