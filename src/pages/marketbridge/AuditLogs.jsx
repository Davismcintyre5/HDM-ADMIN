import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/marketbridge/audit';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Pagination from '../../components/marketbridge/ui/Pagination';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs({ page, limit: 50 })
      .then(res => {
        const d = res?.data || res;
        const list = d.logs || d || [];
        setLogs(Array.isArray(list) ? list : []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const getAdminName = (log) => {
    const admin = log.admin || log.adminId || log.performedBy || {};
    if (typeof admin === 'string') return admin;
    return admin?.name || admin?.email || admin?._id || 'System';
  };

  const getAction = (log) => {
    return log.action || log.type || log.event || 'action';
  };

  const getMessage = (log) => {
    if (typeof log.details === 'object' && log.details !== null) {
      return log.message || log.description || JSON.stringify(log.details).slice(0, 100);
    }
    return log.message || log.description || log.details || '—';
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Audit Logs</h1>
      <Card>
        {logs.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No audit logs found.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={log._id || log.id || i} className="flex items-start gap-3 py-2 border-b border-[var(--border-color)] last:border-0 text-sm">
                <Badge variant="info">{getAction(log)}</Badge>
                <span className="text-[var(--text-muted)] text-xs w-16">{formatDate(log.createdAt || log.timestamp, 'DD/MM/YYYY')}</span>
                <span className="text-[var(--text-muted)] text-xs w-20 truncate">{getAdminName(log)}</span>
                <span className="text-[var(--text-primary)] flex-1 truncate">{getMessage(log)}</span>
              </div>
            ))}
          </div>
        )}
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}