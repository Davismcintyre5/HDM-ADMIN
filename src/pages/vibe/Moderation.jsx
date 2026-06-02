import { useEffect, useState } from 'react';
import { getFlagged, removeContent, dismissContent } from '../../services/vibe/moderation';
import Card from '../../components/vibe/ui/Card';
import Table from '../../components/vibe/ui/Table';
import Badge from '../../components/vibe/ui/Badge';
import Button from '../../components/vibe/ui/Button';
import Pagination from '../../components/vibe/ui/Pagination';
import ConfirmDialog from '../../components/vibe/ui/ConfirmDialog';
import { formatDate } from '../../utils/vibe/formatDate';

export default function Moderation() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, item: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFlagged = () => {
    setLoading(true);
    getFlagged({ page, limit: 20, status: 'pending' })
      .then(res => {
        setItems(res.items || res.data || []);
        setMeta({ total: res.total || 0, page: res.page || 1, pages: res.pages || 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFlagged(); }, [page]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'remove') await removeContent(confirm.item.contentType, confirm.item.contentId);
      else await dismissContent(confirm.item.contentType, confirm.item.contentId);
      setConfirm({ open: false, item: null, type: '' });
      fetchFlagged();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const severityV = { high: 'danger', medium: 'warning', low: 'default' };

  const columns = [
    { key: 'contentType', label: 'Type', render: (row) => <Badge variant="gradient">{row.contentType}</Badge> },
    { key: 'reason', label: 'Reason', render: (row) => <span className="text-sm">{row.reason?.replace(/_/g, ' ')}</span> },
    { key: 'severity', label: 'Severity', render: (row) => <Badge variant={severityV[row.severity] || 'default'}>{row.severity}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, item: row, type: 'remove' })}>Remove</Button>
        <Button size="sm" variant="secondary" onClick={() => setConfirm({ open: true, item: row, type: 'dismiss' })}>Dismiss</Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Moderation</h1>
      <Card>
        <Table columns={columns} data={items} loading={loading} emptyMessage="No flagged content." />
        <Pagination page={page} totalPages={meta.pages || 1} onPageChange={setPage} />
      </Card>
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, item: null, type: '' })}
        title={confirm.type === 'remove' ? 'Remove Content' : 'Dismiss Flag'}
        message={confirm.type === 'remove' ? 'Permanently remove this content?' : 'Dismiss this flag?'}
        confirmLabel={confirm.type === 'remove' ? 'Remove' : 'Dismiss'}
        variant={confirm.type === 'remove' ? 'danger' : 'secondary'}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </div>
  );
}