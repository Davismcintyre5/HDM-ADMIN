import { useState, useEffect } from 'react';
import { getLogs, clearLogs } from '../../services/hdmai2/logs';
import Card from '../../components/hdmai2/ui/Card';
import Table from '../../components/hdmai2/ui/Table';
import Badge from '../../components/hdmai2/ui/Badge';
import Button from '../../components/hdmai2/ui/Button';
import Pagination from '../../components/hdmai2/ui/Pagination';
import { formatDate } from '../../utils/hdmai2/formatDate';

const levelVariant = { info: 'info', warning: 'warning', error: 'danger', debug: 'default' };

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [level, setLevel] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLogs = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (level) params.level = level;
    getLogs(params)
      .then(res => {
        const logData = res?.data?.logs || res?.data || [];
        setLogs(Array.isArray(logData) ? logData : []);
        setTotalPages(res?.data?.pages || 1);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page, level]);

  const handleClear = async () => {
    if (!window.confirm('Clear all logs? This cannot be undone.')) return;
    setActionLoading(true);
    try { await clearLogs({}); fetchLogs(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'level', label: 'Level', render: row => <Badge variant={levelVariant[row.level] || 'default'}>{row.level}</Badge> },
    { key: 'action', label: 'Action', render: row => <span className="text-sm">{row.action?.replace(/_/g, ' ')}</span> },
    { key: 'description', label: 'Description', render: row => <span className="text-xs text-[var(--text-muted)]">{row.description || '—'}</span> },
    { key: 'admin', label: 'By', render: row => <span className="text-sm">{row.admin?.name || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt, 'full') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Logs</h1>
        <div className="flex gap-2">
          <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <Button variant="danger" onClick={handleClear} loading={actionLoading}>Clear Logs</Button>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="No logs found." />
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}