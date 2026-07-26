import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../../services/rvnp/auditLogs';
import Card from '../../../components/rvnp/ui/Card';
import Table from '../../../components/rvnp/ui/Table';
import Badge from '../../../components/rvnp/ui/Badge';
import Pagination from '../../../components/rvnp/ui/Pagination';
import SearchBar from '../../../components/rvnp/ui/SearchBar';
import Spinner from '../../../components/rvnp/ui/Spinner';
import { formatDate } from '../../../utils/rvnp/formatDate';

const actionVariant = { create: 'success', update: 'info', delete: 'danger', login: 'info', logout: 'warning' };

export default function AuditLogsSettings() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs({ page, limit: 10, search })
      .then(res => {
        const data = res?.data || res || {};
        setLogs(data.logs || data.docs || data.data || []);
        setTotalPages(data.totalPages || data.pages || 1);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page, search]);

  const columns = [
    { key: 'action', label: 'Action', render: row => <Badge variant={actionVariant[row.action] || 'default'}>{row.action?.replace('_', ' ')}</Badge> },
    { key: 'entity', label: 'Entity', render: row => <span className="text-sm">{row.entity || row.resource || '—'}</span> },
    { key: 'performedBy', label: 'Performed By', render: row => <span className="text-sm">{row.performedBy?.name || row.admin?.name || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => <span className="text-xs text-[var(--text-muted)]">{formatDate(row.createdAt, 'full')}</span> },
  ];

  if (loading && logs.length === 0) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Audit Logs</h2>
        <SearchBar value={search} onChange={e => { setSearch(e); setPage(1); }} placeholder="Search logs..." />
      </div>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No audit logs found." />
        {totalPages > 1 && <div className="mt-4 flex justify-center"><Pagination current={page} total={totalPages} onPageChange={setPage} /></div>}
      </Card>
    </div>
  );
}