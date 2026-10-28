import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers, HiCash, HiCreditCard, HiClock, HiRefresh,
  HiArrowRight, HiServer, HiChartBar, HiDocumentText,
} from 'react-icons/hi';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Spinner from '../../components/hdmisp/ui/Spinner';
import StatCard from '../../components/hdmisp/ui/StatCard';
import { useToast } from '../../context/hdmisp/ToastContext';
import { useAuth } from '../../context/hdmisp/AuthContext';
import { getReportsSummary } from '../../services/hdmisp/reports';
import { getBillingSummary } from '../../services/hdmisp/billing';
import { getPendingProviders } from '../../services/hdmisp/providers';
import { formatMoneyMajor } from '../../utils/hdmisp/formatMoney';
import { relativeTime } from '../../utils/hdmisp/formatDate';
import { statusVariant, statusLabel } from '../../utils/hdmisp/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { admin, isSuperadmin } = useAuth();

  const [summary, setSummary] = useState(null);
  const [billing, setBilling] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reports, billingRes, pendingRes] = await Promise.all([
        getReportsSummary().catch(() => null),
        getBillingSummary().catch(() => null),
        getPendingProviders({ page: 1, limit: 5 }).catch(() => ({ data: [], meta: null })),
      ]);
      setSummary(reports);
      setBilling(billingRes);
      setPending(pendingRes?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !summary && !billing) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const d = summary || {};
  const b = billing || {};

  const statCards = [
    {
      label: 'Active Providers',
      value: (d.providers ?? 0).toLocaleString(),
      hint: 'All tenants',
      icon: HiUsers,
      color: 'text-cyan-500',
    },
    {
      label: 'Transactions',
      value: (b.completed ?? 0).toLocaleString(),
      hint: 'Completed',
      icon: HiCash,
      color: 'text-green-500',
    },
    {
      label: 'Revenue',
      value: formatMoneyMajor(b.completedRevenue ?? 0, 'KES'),
      hint: 'All time',
      icon: HiCreditCard,
      color: 'text-amber-500',
    },
    {
      label: 'Pending Payments',
      value: (b.pending ?? 0).toLocaleString(),
      hint: 'Awaiting confirmation',
      icon: HiClock,
      color: 'text-orange-500',
    },
  ];

  const quickLinks = [
    { label: 'Pending Providers', desc: 'Review applications', path: '/hdmisp/pending', icon: HiClock, color: 'from-amber-500 to-orange-600' },
    { label: 'Transactions', desc: 'Payment history', path: '/hdmisp/transactions', icon: HiCash, color: 'from-green-500 to-emerald-600' },
    { label: 'Pending Payments', desc: 'Confirm receipts', path: '/hdmisp/pending-payments', icon: HiCreditCard, color: 'from-cyan-500 to-blue-600' },
    { label: 'Reports', desc: 'Revenue analytics', path: '/hdmisp/reports', icon: HiChartBar, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Welcome back{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''} Â· HDM ISP overview
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          onClick={load}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`p-4 rounded-xl bg-gradient-to-r ${link.color} text-white text-left hover:shadow-lg transition-all hover:scale-[1.02] group`}
              type="button"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-6 h-6" />
                <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="font-semibold text-sm">{link.label}</p>
              <p className="text-xs text-white/70 mt-0.5">{link.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Platform summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Platform summary">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Providers</dt>
              <dd className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {(d.providers ?? 0).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Sessions</dt>
              <dd className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {(d.sessions ?? 0).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Transactions</dt>
              <dd className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {(d.transactions ?? 0).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)] text-xs">Failed txns</dt>
              <dd className="text-2xl font-bold text-red-500 mt-1">
                {(b.failed ?? 0).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card
          title="Billing"
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/hdmisp/transactions')}
              icon={<HiArrowRight className="w-4 h-4" />}
            >
              View all
            </Button>
          }
        >
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Pending</dt>
              <dd className="text-[var(--text-primary)] font-medium">
                {(b.pending ?? 0).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Completed</dt>
              <dd className="text-green-600 font-medium">
                {(b.completed ?? 0).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Revenue</dt>
              <dd className="text-[var(--text-primary)] font-semibold">
                {formatMoneyMajor(b.completedRevenue ?? 0, 'KES')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Failed</dt>
              <dd className="text-red-500 font-medium">
                {(b.failed ?? 0).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Recent pending providers */}
      <Card
        title="Recent pending providers"
        description="Latest registrations awaiting review"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/hdmisp/pending')}
            icon={<HiArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        }
        padding={false}
      >
        <div className="divide-y divide-[var(--border-color)]">
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">
              No pending providers
            </p>
          ) : (
            pending.map((p) => (
              <button
                key={p._id}
                onClick={() => navigate(`/hdmisp/pending/${p._id}`)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                type="button"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {p.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant(p.status)} dot>
                    {statusLabel(p.status)}
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
  );
}