import { useEffect, useState } from 'react';
import Card from '../../components/smartpos/ui/Card';
import Table from '../../components/smartpos/ui/Table';
import Input from '../../components/smartpos/ui/Input';
import Pagination from '../../components/smartpos/ui/Pagination';
import { getAuditLogs } from '../../services/smartpos/audit';
import { formatDateTime } from '../../utils/smartpos/formatDate';

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAuditLogs({ page, limit: 20, action: action || undefined })
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
  }, [page, action]);

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-primary)]">
          {row.action}
        </span>
      ),
    },
    {
      key: 'adminId',
      label: 'Admin',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {row.adminId ? String(row.adminId).slice(-8) : '—'}
        </span>
      ),
    },
    {
      key: 'tenantId',
      label: 'Client',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {row.tenantId ? String(row.tenantId).slice(-8) : '—'}
        </span>
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">{row.ip || '—'}</span>
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit log</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Every mutating admin action
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <Input
            placeholder="Filter by action (e.g. POST /tenants)"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No actions logged"
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