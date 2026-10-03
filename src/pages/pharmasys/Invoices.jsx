import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/pharmasys/ui/Card';
import Table from '../../components/pharmasys/ui/Table';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Select from '../../components/pharmasys/ui/Select';
import Pagination from '../../components/pharmasys/ui/Pagination';
import { getInvoices } from '../../services/pharmasys/invoices';
import { formatDate } from '../../utils/pharmasys/formatDate';
import { formatMoneyMajor } from '../../utils/pharmasys/formatMoney';
import { statusVariant, statusLabel } from '../../utils/pharmasys/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Invoices() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInvoices({
      page,
      limit: 20,
      status: status || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, status]);

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-medium text-[var(--text-primary)]">
            {row.invoiceNumber || row._id?.slice(-8) || '—'}
          </p>
          {row.tenant?.name && (
            <p className="text-xs text-[var(--text-muted)]">
              {row.tenant.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.total, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'amountDue',
      label: 'Amount due',
      align: 'right',
      render: (row) => (
        <span
          className={
            row.amountDue > 0
              ? 'font-medium text-rose-600'
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
      key: 'issuedAt',
      label: 'Issued',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.issuedAt ? formatDate(row.issuedAt) : '—'}
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
            navigate(`/pharmasys/invoices/${row._id || row.id}`);
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
          {meta.total} total invoices
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
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
              navigate(`/pharmasys/invoices/${row._id || row.id}`)
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