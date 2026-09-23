import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import SearchBar from '../../components/smartpos/ui/SearchBar';
import Select from '../../components/smartpos/ui/Select';
import Pagination from '../../components/smartpos/ui/Pagination';
import { getClients } from '../../services/smartpos/clients';
import { formatDate } from '../../utils/smartpos/formatDate';
import { statusVariant, CLIENT_STATUS_LIST } from '../../utils/smartpos/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...CLIENT_STATUS_LIST.map((s) => ({
    value: s,
    label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
];

export default function Clients() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClients({
      page,
      limit: 20,
      search: search || undefined,
      status: status || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        setItems(data?.data || data || []);
        setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, status]);

  const columns = [
    {
      key: 'name',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">{row.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'country',
      label: 'Country',
      render: (row) => (
        <span className="text-[var(--text-secondary)]">{row.country || '—'}</span>
      ),
    },
    {
      key: 'businessType',
      label: 'Type',
      render: (row) => (
        <span className="text-[var(--text-secondary)] capitalize">
          {row.businessType || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {(row.status || '').replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'planId',
      label: 'Plan',
      render: (row) => (
        <span className="text-[var(--text-secondary)] capitalize">
          {row.planId || '—'}
        </span>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-[var(--text-muted)] text-xs">
          {row.registeredAt ? formatDate(row.registeredAt) : '—'}
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
          onClick={() => navigate(`/smartpos/clients/${row._id || row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clients</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} registered businesses
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name..."
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
            onRowClick={(row) => navigate(`/smartpos/clients/${row._id || row.id}`)}
            emptyMessage="No clients found"
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