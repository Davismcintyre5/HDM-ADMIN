import { useState, useEffect } from 'react';
import { getPosts, getReels, getComments, deletePost, deleteReel, deleteComment, restorePost, restoreReel, restoreComment } from '../../services/rvnp/moderation';
import Card from '../../components/rvnp/ui/Card';
import Table from '../../components/rvnp/ui/Table';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Pagination from '../../components/rvnp/ui/Pagination';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiTrash, HiRefresh } from 'react-icons/hi';

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'reels', label: 'Reels' },
  { key: 'comments', label: 'Comments' },
];

export default function Moderation() {
  const [activeTab, setActiveTab] = useState('posts');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const fetchers = { posts: getPosts, reels: getReels, comments: getComments };
    fetchers[activeTab]({ page, limit: 20 })
      .then(res => {
        setItems(res?.data?.items || res?.data || []);
        setPagination(res?.data?.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    setActionLoading(true);
    try {
      const deleters = { posts: deletePost, reels: deleteReel, comments: deleteComment };
      await deleters[activeTab](id); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try {
      const restorers = { posts: restorePost, reels: restoreReel, comments: restoreComment };
      await restorers[activeTab](id); fetchData();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'content', label: 'Content', render: row => <span className="text-sm text-[var(--text-primary)]">{row.content || row.caption || row.text || row._id}</span> },
    { key: 'author', label: 'Author', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.user?.fullName || row.user?.name || '—'}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={row.status === 'active' ? 'success' : 'danger'}>{row.status || 'active'}</Badge> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        {row.status !== 'deleted' ? (
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id || row._id)}><HiTrash className="w-3 h-3" /></Button>
        ) : (
          <Button size="sm" variant="success" onClick={() => handleRestore(row.id || row._id)}><HiRefresh className="w-3 h-3" /></Button>
        )}
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Moderation</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <Table columns={columns} data={items} loading={loading} emptyMessage={`No ${activeTab} found.`} />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>
    </div>
  );
}