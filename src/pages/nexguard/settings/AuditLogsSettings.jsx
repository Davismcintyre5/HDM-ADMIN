import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../../services/nexguard/auditLogs';
import Card from '../../../components/nexguard/ui/Card';
import Table from '../../../components/nexguard/ui/Table';
import Badge from '../../../components/nexguard/ui/Badge';
import Input from '../../../components/nexguard/ui/Input';
import Spinner from '../../../components/nexguard/ui/Spinner';
import Pagination from '../../../components/nexguard/ui/Pagination';
import SearchBar from '../../../components/nexguard/ui/SearchBar';

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
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page, search]);

  const actionVariant = {
    create: 'success',
    update: 'info',
    delete: 'danger',
    login: 'info',
    logout: 'warning',
    restore: 'warning',
    upload: 'info',
    download: 'info',
    settings_update: 'info',
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: row => (
        <Badge variant={actionVariant[row.action] || 'default'}>
          {row.action?.replace('_', ' ')}
        </Badge>
      ),
    },
    { key: 'entity', label: 'Entity', render: row => <span className="text-sm">{row.entity || row.resource || '-'}</span> },
    { key: 'performedBy', label: 'Performed By', render: row => <span className="text-sm">{row.performedBy?.name || row.user?.name || row.admin?.name || '-'}</span> },
    { key: 'createdAt', label: 'Date', render: row => <span className="text-xs text-[var(--text-muted)]">{new Date(row.createdAt).toLocaleString()}</span> },
  ];

  if (loading && logs.length === 0) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Audit Logs</h2>
        <SearchBar
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search logs..."
        />
      </div>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No audit logs found." />
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination current={page} total={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}