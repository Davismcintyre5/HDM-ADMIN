// src/pages/talanta/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiTicket,
  HiCash,
  HiMail,
  HiTag,
  HiRefresh,
  HiArrowRight,
  HiClock,
} from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Table from '../../components/talanta/ui/Table';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Spinner from '../../components/talanta/ui/Spinner';
import StatCard from '../../components/talanta/ui/StatCard';
import { getMatch } from '../../services/talanta/match';
import { getCategories } from '../../services/talanta/categories';
import { getTickets } from '../../services/talanta/tickets';
import { getPayments } from '../../services/talanta/payments';
import { getNotifyList } from '../../services/talanta/notify';
import { formatDate, formatDateTime, relativeTime } from '../../utils/talanta/formatDate';
import { formatMoneyMajor } from '../../utils/talanta/formatMoney';
import { statusVariant, formatMatchStatus } from '../../utils/talanta/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [match, categories, tickets, payments, notify] = await Promise.all([
        getMatch().catch(() => null),
        getCategories().catch(() => []),
        getTickets({ page: 1, limit: 5 }).catch(() => ({ items: [], meta: {} })),
        getPayments({ page: 1, limit: 5 }).catch(() => ({ items: [], meta: {} })),
        getNotifyList({ page: 1, limit: 1 }).catch(() => ({ meta: { total: 0 } })),
      ]);
      setData({ match, categories, tickets, payments, notify });
    } catch (err) {
      setError(err.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Could not load dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">{error}</p>
        <Button className="mt-6" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
          Retry
        </Button>
      </div>
    );
  }

  const match = data?.match;
  const cats = data?.categories || [];
  const tickets = data?.tickets?.items || [];
  const payments = data?.payments?.items || [];
  const notify = data?.notify;

  const revenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const ticketColumns = [
    {
      key: 'serial',
      label: 'Serial',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-primary)]">
          {row.serial || '—'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <Badge variant="info">
          {row.categoryId?.name || '—'}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">
          {formatMoneyMajor(row.price || 0, row.currency || 'KES')}
        </span>
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
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {relativeTime(row.createdAt)}
        </span>
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
            Talanta Sports City overview
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Seat categories"
          value={cats.length}
          hint={`${cats.filter((c) => c.isActive !== false).length} active`}
          icon={HiTag}
          color="text-sky-500"
        />
        <StatCard
          label="Tickets sold"
          value={data?.tickets?.meta?.total ?? 0}
          hint="All statuses"
          icon={HiTicket}
          color="text-blue-500"
        />
        <StatCard
          label="Recent revenue"
          value={formatMoneyMajor(revenue, 'KES')}
          hint="Latest 5 paid"
          icon={HiCash}
          color="text-green-500"
        />
        <StatCard
          label="Notify list"
          value={notify?.meta?.total ?? 0}
          hint="Subscribers"
          icon={HiMail}
          color="text-amber-500"
        />
      </div>

      {/* Match card */}
      <Card
        title="Next match"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/talanta/match')}
            icon={<HiArrowRight className="w-4 h-4" />}
          >
            Edit
          </Button>
        }
      >
        {match ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {match.homeTeam} <span className="text-[var(--text-muted)]">vs</span> {match.awayTeam}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {match.venue?.name || '—'} · {match.venue?.address || ''}
                </p>
              </div>
              <Badge variant={statusVariant(match.status)} dot>
                {formatMatchStatus(match.status)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-3 border-t border-[var(--border-color)]">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Kickoff</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {match.kickoff ? formatDateTime(match.kickoff) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Gates open</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {match.gatesOpen ? formatDateTime(match.gatesOpen) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Sale opens</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {match.saleOpensAt ? formatDateTime(match.saleOpensAt) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Seat type</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {match.seatType || '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No match configured yet. Head to Match to set one up.
          </p>
        )}
      </Card>

      {/* Recent tickets */}
      <Card
        title="Recent tickets"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/talanta/tickets')}
            icon={<HiArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        }
        padding={false}
      >
        <div className="p-4">
          <Table
            columns={ticketColumns}
            data={tickets}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No tickets yet"
          />
        </div>
      </Card>

      {/* Recent payments */}
      <Card
        title="Recent payments"
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/talanta/payments')}
            icon={<HiArrowRight className="w-4 h-4" />}
          >
            View all
          </Button>
        }
        padding={false}
      >
        <div className="divide-y divide-[var(--border-color)]">
          {payments.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">
              No payments yet
            </p>
          ) : (
            payments.map((p) => (
              <button
                key={p._id}
                onClick={() => navigate(`/talanta/payments/${p._id}`)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatMoneyMajor(p.amount, p.currency || 'KES')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">
                    {p.method} · {p.status}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {relativeTime(p.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}