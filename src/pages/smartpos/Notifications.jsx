import { useState, useEffect } from 'react';
import { getNotifications, markRead, markAllRead } from '../../services/smartpos/notifications';
import Card from '../../components/smartpos/ui/Card';
import Badge from '../../components/smartpos/ui/Badge';
import Button from '../../components/smartpos/ui/Button';
import Pagination from '../../components/smartpos/ui/Pagination';
import Spinner from '../../components/smartpos/ui/Spinner';
import { formatDate } from '../../utils/smartpos/formatDate';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'true', label: 'Unread' },
  { key: 'false', label: 'Read' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.unread = filter;
    getNotifications(params)
      .then(res => { setNotifications(res?.data || []); setPagination(res?.meta || { page: 1, pages: 1 }); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, filter]);

  const handleRead = async (id) => { setActionLoading(true); try { await markRead(id); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };
  const handleReadAll = async () => { setActionLoading(true); try { await markAllRead(); fetchData(); } catch (err) { alert(err.message); } setActionLoading(false); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
        <Button variant="secondary" onClick={handleReadAll} loading={actionLoading}>Mark All Read</Button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <Card>
          {notifications.length === 0 ? <p className="text-sm text-[var(--text-muted)] text-center py-8">No notifications.</p> : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n._id || n.id} onClick={() => !n.read && handleRead(n._id || n.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${n.read ? 'bg-[var(--card-bg)] border border-[var(--border-color)]' : 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-[var(--text-primary)] text-sm">{n.title || n.type}</h3>
                    {!n.read && <Badge variant="info">New</Badge>}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{n.message}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(n.createdAt, 'full')}</p>
                </div>
              ))}
            </div>
          )}
          <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}