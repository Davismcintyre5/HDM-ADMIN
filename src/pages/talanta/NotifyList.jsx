// src/pages/talanta/NotifyList.jsx
import { useEffect, useState, useCallback } from 'react';
import { HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Table from '../../components/talanta/ui/Table';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import SearchBar from '../../components/talanta/ui/SearchBar';
import Select from '../../components/talanta/ui/Select';
import Pagination from '../../components/talanta/ui/Pagination';
import { useToast } from '../../context/talanta/ToastContext';
import { getNotifyList } from '../../services/talanta/notify';
import { formatDate } from '../../utils/talanta/formatDate';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Confirmed' },
  { value: 'false', label: 'Pending' },
];

export default function NotifyList() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [confirmed, setConfirmed] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { items: list, meta: m } = await getNotifyList({
        page: p,
        limit: 20,
        confirmed: confirmed === '' ? undefined : confirmed === 'true',
        q: search || undefined,
      });
      setItems(list);
      setMeta(m);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [confirmed, search, toast]);

  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page, confirmed, search]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">{row.email}</span>
      ),
    },
    {
      key: 'confirmed',
      label: 'Status',
      render: (row) =>
        row.confirmed ? (
          <Badge variant="success" dot>Confirmed</Badge>
        ) : (
          <Badge variant="warning" dot>Pending</Badge>
        ),
    },
    {
      key: 'confirmedAt',
      label: 'Confirmed',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.confirmedAt ? formatDate(row.confirmedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Subscribed',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notify List</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} subscribers
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={() => load(page)} loading={loading}>
          Refresh
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search by email..."
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={confirmed}
              onChange={(e) => { setConfirmed(e.target.value); setPage(1); }}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No subscribers yet"
          />
          <Pagination page={meta.page} totalPages={meta.pages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}