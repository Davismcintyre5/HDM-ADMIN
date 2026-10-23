import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/meteo/ui/Card';
import Table from '../../components/meteo/ui/Table';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import SearchBar from '../../components/meteo/ui/SearchBar';
import Select from '../../components/meteo/ui/Select';
import Pagination from '../../components/meteo/ui/Pagination';
import { getInvoices } from '../../services/meteo/invoices';
import { formatDate } from '../../utils/meteo/formatDate';
import { formatMoneyMajor } from '../../utils/meteo/formatMoney';
import { INVOICE_STATUS_LIST, statusVariant, statusLabel } from '../../utils/meteo/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...INVOICE_STATUS_LIST.map((s) => ({ value: s, label: statusLabel(s) })),
];

export default function Invoices() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInvoices({
      page,
      limit: 20,
      status: status || undefined,
      tenantId: tenantId || undefined,
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
  }, [page, status, tenantId]);

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-[var(--text-primary)]">
          {row.invoiceNumber || row._id?.slice(-8) || '—'}
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
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.total, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'amountDue',
      label: 'Due',
      align: 'right',
      render: (row) => (
        <span
          className={
            row.amountDue > 0
              ? 'font-medium text-red-600 dark:text-red-400'
              : 'text-[var(--text-muted)]'
          }
        >
          {formatMoneyMajor(row.amountDue || 0, row.currency || 'KES')}
        </span>
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
      key: 'dueDate',
      label: 'Due',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.dueDate ? formatDate(row.dueDate) : '—'}
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
            navigate(`/meteo/invoices/${row._id || row.id}`);
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
          Invoices
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} invoices
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
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) =>
              navigate(`/meteo/invoices/${row._id || row.id}`)
            }
            emptyMessage="No invoices found"
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