import { useEffect, useState, useCallback } from 'react';
import { HiCheck, HiTrash, HiBell, HiRefresh } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Card from '../../components/hdmisp/ui/Card';
import Badge from '../../components/hdmisp/ui/Badge';
import Button from '../../components/hdmisp/ui/Button';
import Pagination from '../../components/hdmisp/ui/Pagination';
import { useToast } from '../../context/hdmisp/ToastContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/hdmisp/notifications';
import { relativeTime } from '../../utils/hdmisp/formatDate';
import { PAGE_LIMIT } from '../../utils/hdmisp/constants';

export default function Notifications() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({
        page,
        limit: PAGE_LIMIT,
        unreadOnly: unreadOnly || undefined,
      });
      setItems(res.data || []);
      setMeta({
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        total: res.meta?.total || 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly, toast]);

  useEffect(() => { load(); }, [load]);

  const doMarkRead = async (id) => {
    setBusy(id);
    try {
      await markNotificationRead(id);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to mark read');
    } finally {
      setBusy(null);
    }
  };

  const doMarkAll = async () => {
    setBusy('all');
    try {
      const res = await markAllNotificationsRead();
      toast.success(`Marked ${res?.modified ?? 0} as read`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to mark all');
    } finally {
      setBusy(null);
    }
  };

  const doDelete = async (id) => {
    setBusy(id);
    try {
      await deleteNotification(id);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{meta.total} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>Refresh</Button>
          <Button size="sm" variant="secondary" icon={<HiCheck className="w-4 h-4" />} onClick={doMarkAll} loading={busy === 'all'} disabled={meta.total === 0}>Mark all read</Button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setUnreadOnly(false); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!unreadOnly ? 'bg-cyan-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`} type="button">All</button>
        <button onClick={() => { setUnreadOnly(true); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${unreadOnly ? 'bg-cyan-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`} type="button">Unread only</button>
      </div>

      <Card padding={false}>
        <div className="divide-y divide-[var(--border-color)]">
          {loading && !items.length ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[var(--border-color)] border-t-cyan-600 rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <HiBell className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No notifications</p>
            </div>
          ) : (
            items.map((n) => (
              <div key={n._id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? 'bg-cyan-50/40 dark:bg-cyan-950/10' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-cyan-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                    <Badge variant="default">{n.type}</Badge>
                  </div>
                  {n.body && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.body}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    {n.link && (
                      <Link to={n.link} className="text-xs text-cyan-600 hover:underline" onClick={() => !n.read && doMarkRead(n._id)}>Open</Link>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">{relativeTime(n.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <Button size="sm" variant="ghost" onClick={() => doMarkRead(n._id)} loading={busy === n._id} title="Mark read">
                      <HiCheck className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => doDelete(n._id)} loading={busy === n._id} title="Delete">
                    <HiTrash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-color)]">
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}