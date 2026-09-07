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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);

    const fetchers = { posts: getPosts, reels: getReels, comments: getComments };

    fetchers[activeTab]({ page, limit })
      .then(res => {
        const responseData = res?.data?.data || res?.data || res;

        if (Array.isArray(responseData)) {
          setItems(responseData);
          setTotal(responseData.length);
        } else if (responseData?.posts) {
          setItems(responseData.posts);
          setTotal(responseData.total || responseData.posts.length);
        } else if (responseData?.reels) {
          setItems(responseData.reels);
          setTotal(responseData.total || responseData.reels.length);
        } else if (responseData?.comments) {
          setItems(responseData.comments);
          setTotal(responseData.total || responseData.comments.length);
        } else {
          setItems([]);
          setTotal(0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, activeTab]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    setActionLoading(true);
    try {
      const deleters = { posts: deletePost, reels: deleteReel, comments: deleteComment };
      await deleters[activeTab](id);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try {
      const restorers = { posts: restorePost, reels: restoreReel, comments: restoreComment };
      await restorers[activeTab](id);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getContentText = (row) => {
    if (!row) return '—';

    const content = row.content;

    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      if (typeof content.text === 'string') return content.text;
      if (typeof content.caption === 'string') return content.caption;
      return 'Media content';
    }

    if (typeof row.caption === 'string') return row.caption;
    if (typeof row.text === 'string') return row.text;

    return '—';
  };

  const getAuthorName = (row) => {
    if (!row) return '—';

    if (row.user?.fullName) return row.user.fullName;
    if (row.user?.name) return row.user.name;
    if (row.user?.email) return row.user.email;

    return '—';
  };

  const getRowId = (row) => {
    return row.id || row._id || '';
  };

  const getRowStatus = (row) => {
    if (row.deletedAt) return 'deleted';
    if (row.status) return row.status;
    return 'active';
  };

  const columns = [
    {
      key: 'content',
      label: 'Content',
      render: row => (
        <span className="text-sm text-[var(--text-primary)] truncate max-w-[200px] block">
          {getContentText(row)}
        </span>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      render: row => (
        <span className="text-sm text-[var(--text-secondary)]">{getAuthorName(row)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: row => {
        const status = getRowStatus(row);
        return (
          <Badge variant={status === 'deleted' ? 'danger' : 'success'}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: row => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: '',
      render: row => {
        const status = getRowStatus(row);
        return (
          <div className="flex gap-1">
            {status !== 'deleted' ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(getRowId(row))}
                disabled={actionLoading}
              >
                <HiTrash className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="success"
                onClick={() => handleRestore(getRowId(row))}
                disabled={actionLoading}
              >
                <HiRefresh className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Moderation</h1>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage={`No ${activeTab} found.`}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}