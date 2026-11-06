// src/pages/talanta/Payments.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Table from '../../components/talanta/ui/Table';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Select from '../../components/talanta/ui/Select';
import Pagination from '../../components/talanta/ui/Pagination';
import { useToast } from '../../context/talanta/ToastContext';
import { getPayments } from '../../services/talanta/payments';
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  statusVariant,
  formatMethod,
  formatPaymentStatus,
} from '../../utils/talanta/constants';
import { formatDateTime } from '../../utils/talanta/formatDate';
import { formatMoneyMajor } from '../../utils/talanta/formatMoney';

const METHOD_OPTIONS = [
  { value: '', label: 'All methods' },
  ...PAYMENT_METHODS.map((m) => ({ value: m, label: formatMethod(m) })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...PAYMENT_STATUSES.map((s) => ({ value: s, label: formatPaymentStatus(s) })),
];

export default function Payments() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { items: list, meta: m } = await getPayments({
        page: p,
        limit: 20,
        method: method || undefined,
        status: status || undefined,
      });
      setItems(list);
      setMeta(m);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [method, status, toast]);

  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page, method, status]);

  const columns = [
    {
      key: 'method',
      label: 'Method',
      render: (row) => <Badge variant="info">{formatMethod(row.method)}</Badge>,
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
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {formatPaymentStatus(row.status)}
        </Badge>
      ),
    },
    {
      key: 'tickets',
      label: 'Tickets',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.ticketIds?.length ?? 0} ticket{(row.ticketIds?.length ?? 0) === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {formatDateTime(row.createdAt)}
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
            navigate(`/talanta/payments/${row._id || row.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payments</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} transactions
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={() => load(page)} loading={loading}>
          Refresh
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <Select
              value={method}
              onChange={(e) => { setMethod(e.target.value); setPage(1); }}
              options={METHOD_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
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
            onRowClick={(row) => navigate(`/talanta/payments/${row._id || row.id}`)}
            emptyMessage="No payments found"
          />
          <Pagination page={meta.page} totalPages={meta.pages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}