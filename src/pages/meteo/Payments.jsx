import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/meteo/ui/Card';
import Table from '../../components/meteo/ui/Table';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import SearchBar from '../../components/meteo/ui/SearchBar';
import Select from '../../components/meteo/ui/Select';
import Pagination from '../../components/meteo/ui/Pagination';
import { getPayments } from '../../services/meteo/payments';
import { formatDateTime } from '../../utils/meteo/formatDate';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';
import {
  PAYMENT_STATUS_LIST,
  PAYMENT_TYPE,
  statusVariant,
  statusLabel,
} from '../../utils/meteo/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...PAYMENT_STATUS_LIST.map((s) => ({ value: s, label: statusLabel(s) })),
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: PAYMENT_TYPE.PAYMENT, label: 'Payment' },
  { value: PAYMENT_TYPE.REFUND, label: 'Refund' },
];

export default function Payments() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPayments({
      page,
      limit: 20,
      tenantId: tenantId || undefined,
      status: status || undefined,
      type: type || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        setItems(data?.items || []);
        setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, tenantId, status, type]);

  const columns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-primary)]">
          {row.reference || row._id?.slice(-8) || '—'}
        </span>
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
        <span
          className={`font-medium ${
            row.type === 'refund'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-[var(--text-primary)]'
          }`}
        >
          {row.type === 'refund' ? '−' : ''}
          {formatMoneyMajor(row.amount, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <Badge variant={row.type === 'refund' ? 'info' : 'success'}>
          {statusLabel(row.type || 'payment')}
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
      label: 'When',
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
            navigate(`/meteo/payments/${row._id || row.id}`);
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Payments
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} transactions
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={tenantId}
              onChange={(v) => {
                setTenantId(v);
                setPage(1);
              }}
              placeholder="Filter by tenant ID..."
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              options={TYPE_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
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
              navigate(`/meteo/payments/${row._id || row.id}`)
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