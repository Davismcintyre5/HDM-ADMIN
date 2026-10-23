import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiClock,
  HiRefresh,
  HiInbox,
  HiArrowUp,
} from 'react-icons/hi';
import Card from '../../components/meteo/ui/Card';
import Table from '../../components/meteo/ui/Table';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import Spinner from '../../components/meteo/ui/Spinner';
import { useToast } from '../../context/meteo/ToastContext';
import { getPendingList } from '../../services/meteo/pending';
import { relativeTime } from '../../utils/meteo/formatDate';
import { statusVariant, statusLabel } from '../../utils/meteo/constants';

const TABS = [
  { key: 'registrations', label: 'Registrations', icon: HiInbox },
  { key: 'renewals', label: 'Renewals', icon: HiRefresh },
  { key: 'upgrades', label: 'Upgrades', icon: HiArrowUp },
];

const POLL_MS = 30000;

export default function Pending() {
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState('registrations');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pollRef = useRef(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await getPendingList({ tab, page, limit: 20 });
        setData(res?.data || res);
      } catch (err) {
        if (!silent) toast.error(err.message || 'Failed to load pending');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tab, page, toast]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  useEffect(() => {
    pollRef.current = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const counts = data?.counts || {
    registrations: 0,
    renewals: 0,
    upgrades: 0,
  };
  const items = data?.items || [];
  const meta = data?.meta || { total: 0, page: 1, pages: 1 };

  const columns = [
    {
      key: 'name',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {row.name || row.tenant?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {row.slug || row.tenant?.slug || row._id?.slice(-8)}
          </p>
        </div>
      ),
    },
    {
      key: 'planCode',
      label: 'Plan',
      render: (row) => (
        <Badge variant="info">
          {row.planCode || row.tenant?.planCode || '—'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {statusLabel(row.status)}
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
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/meteo/pending/${row._id || row.id}`);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Pending approvals
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} awaiting review
        </p>
      </div>

      {/* Tab strip */}
      <div className="grid grid-cols-3 gap-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = counts[t.key] || 0;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition ${
                isActive
                  ? 'border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                <span
                  className={`text-sm font-medium truncate ${
                    isActive
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {t.label}
                </span>
              </div>
              <Badge
                variant={count === 0 ? 'default' : 'warning'}
                dot={count > 0}
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) =>
              navigate(`/meteo/pending/${row._id || row.id}`)
            }
            emptyMessage={`No ${tab} awaiting review`}
          />
        </div>
      </Card>
    </div>
  );
}