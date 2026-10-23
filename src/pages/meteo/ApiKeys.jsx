import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/meteo/ui/Card';
import Table from '../../components/meteo/ui/Table';
import Badge from '../../components/meteo/ui/Badge';
import Button from '../../components/meteo/ui/Button';
import SearchBar from '../../components/meteo/ui/SearchBar';
import Select from '../../components/meteo/ui/Select';
import Pagination from '../../components/meteo/ui/Pagination';
import ConfirmDialog from '../../components/meteo/ui/ConfirmDialog';
import { useToast } from '../../context/meteo/ToastContext';
import { getApiKeys, revokeApiKey } from '../../services/meteo/apiKeys';
import { formatDate, relativeTime } from '../../utils/meteo/formatDate';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
];

export default function ApiKeys() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [confirmRevoke, setConfirmRevoke] = useState({ open: false, key: null });

  const load = () => {
    setLoading(true);
    getApiKeys({
      page,
      limit: 20,
      tenantId: tenantId || undefined,
      status: status || undefined,
    })
      .then((res) => {
        const data = res?.data || res;
        setItems(data?.items || []);
        setMeta(data?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tenantId, status]);

  const handleRevoke = async () => {
    if (!confirmRevoke.key) return;
    const id = confirmRevoke.key._id || confirmRevoke.key.id;
    setBusyId(id);
    try {
      await revokeApiKey(id);
      toast.success('API key revoked');
      setConfirmRevoke({ open: false, key: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to revoke');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: 'masked',
      label: 'Key',
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-[var(--text-primary)]">
            {row.masked || '••••'}
          </p>
          {row.name && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {row.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'tenant',
      label: 'Tenant',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (row.tenantId) navigate(`/meteo/tenants/${row.tenantId}`);
          }}
          className="text-sm text-violet-600 hover:underline"
          type="button"
        >
          {row.tenant?.name || row.tenantName || row.tenantId?.slice(-8) || '—'}
        </button>
      ),
    },
    {
      key: 'scopes',
      label: 'Scopes',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.scopes || []).map((s) => (
            <Badge key={s} variant="info">
              {s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'} dot>
          {row.status || 'active'}
        </Badge>
      ),
    },
    {
      key: 'lastUsedAt',
      label: 'Last used',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.lastUsedAt ? relativeTime(row.lastUsedAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'active' ? (
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmRevoke({ open: true, key: row });
            }}
            loading={busyId === (row._id || row.id)}
          >
            Revoke
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          API Keys
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} key{meta.total !== 1 ? 's' : ''}
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
            emptyMessage="No API keys found"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={confirmRevoke.open}
        onClose={() => setConfirmRevoke({ open: false, key: null })}
        onConfirm={handleRevoke}
        title="Revoke API key"
        message={`Revoke ${confirmRevoke.key?.masked}? The owner will be notified by email. This cannot be undone.`}
        confirmLabel="Revoke"
        variant="danger"
        loading={busyId === (confirmRevoke.key?._id || confirmRevoke.key?.id)}
      />
    </div>
  );
}