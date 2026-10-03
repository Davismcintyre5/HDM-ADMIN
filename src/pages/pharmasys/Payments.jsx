import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/pharmasys/ui/Card';
import Table from '../../components/pharmasys/ui/Table';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import SearchBar from '../../components/pharmasys/ui/SearchBar';
import Select from '../../components/pharmasys/ui/Select';
import Pagination from '../../components/pharmasys/ui/Pagination';
import StatCard from '../../components/pharmasys/ui/StatCard';
import {
  HiCash,
  HiCheckCircle,
  HiXCircle,
  HiClock,
} from 'react-icons/hi';
import { getPayments, getPaymentStats } from '../../services/pharmasys/payments';
import { formatDateTime } from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import {
  PAYMENT_STATUS_LIST,
  PAYMENT_METHODS,
  statusVariant,
  statusLabel,
} from '../../utils/pharmasys/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...PAYMENT_STATUS_LIST.map((s) => ({ value: s, label: statusLabel(s) })),
];

const METHOD_OPTIONS = [
  { value: '', label: 'All methods' },
  ...PAYMENT_METHODS.map((m) => ({ value: m, label: statusLabel(m) })),
];

export default function Payments() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getPayments({
        page,
        limit: 20,
        status: status || undefined,
        method: method || undefined,
      }),
      page === 1 ? getPaymentStats() : Promise.resolve(null),
    ])
      .then(([list, st]) => {
        if (cancelled) return;
        setItems(list?.data || []);
        setMeta(list?.meta || { page: 1, pages: 1, total: 0 });
        if (st) setStats(st?.data || st);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, status, method]);

  const columns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-[var(--text-primary)]">
            {row.reference || row._id?.slice(-8) || '—'}
          </p>
          {row.invoiceNumber && (
            <p className="text-xs text-[var(--text-muted)]">
              Invoice {row.invoiceNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'tenant',
      label: 'Tenant',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">
          {row.tenant?.name || row.tenantName || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.amount, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <Badge variant="info">{statusLabel(row.method)}</Badge>
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
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDateTime(row.createdAt) : '—'}
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
            navigate(`/pharmasys/payments/${row._id || row.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payments</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} total payments
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Succeeded"
            value={stats?.byStatus?.success ?? 0}
            icon={HiCheckCircle}
            color="text-green-500"
          />
          <StatCard
            label="Pending"
            value={stats?.byStatus?.pending ?? 0}
            icon={HiClock}
            color="text-amber-500"
          />
          <StatCard
            label="Failed"
            value={stats?.byStatus?.failed ?? 0}
            icon={HiXCircle}
            color="text-red-500"
          />
          <StatCard
            label="Total amount"
            value={formatMoneyMajor(stats?.totals?.amount ?? 0, 'KES')}
            icon={HiCash}
            color="text-rose-500"
          />
        </div>
      )}

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              placeholder="Filter by status..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
              options={METHOD_OPTIONS}
            />
          </div>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) =>
              navigate(`/pharmasys/payments/${row._id || row.id}`)
            }
            emptyMessage="No payments found"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}