import { useEffect, useState, useMemo } from 'react';
import {
  getContacts,
  markAsRead,
  markAsArchived,
  deleteContact,
} from '../../services/portfolio/contacts';
import Card from '../../components/portfolio/ui/Card';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import SearchBar from '../../components/portfolio/ui/SearchBar';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import Spinner from '../../components/portfolio/ui/Spinner';
import { useToast } from '../../context/portfolio/ToastContext';
import { formatDate, relativeTime } from '../../utils/portfolio/formatDate';
import {
  HiMail,
  HiArchive,
  HiTrash,
  HiCheckCircle,
  HiReply,
  HiInbox,
} from 'react-icons/hi';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'archived', label: 'Archived' },
];

export default function Contacts() {
  const toast = useToast();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const fetchContacts = () => {
    setLoading(true);
    getContacts()
      .then((res) => setContacts(res.data || res || []))
      .catch((err) => toast.error(err.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = contacts;

    if (filter === 'unread') list = list.filter((c) => !c.isRead);
    else if (filter === 'archived') list = list.filter((c) => c.isArchived);
    else list = list.filter((c) => !c.isArchived);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.message?.toLowerCase().includes(q)
      );
    }

    return [...list].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [contacts, filter, search]);

  const selected = contacts.find((c) => c._id === selectedId) || null;

  const unreadCount = contacts.filter(
    (c) => !c.isRead && !c.isArchived
  ).length;

  const handleSelect = async (contact) => {
    setSelectedId(contact._id);
    if (!contact.isRead) {
      try {
        await markAsRead(contact._id);
        setContacts((prev) =>
          prev.map((c) =>
            c._id === contact._id ? { ...c, isRead: true } : c
          )
        );
      } catch {
        /* silent */
      }
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(true);
    try {
      await markAsArchived(id);
      toast.success('Message archived');
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isArchived: true } : c))
      );
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to archive');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setActionLoading(true);
    try {
      await deleteContact(confirmDelete.id);
      toast.success('Message deleted');
      setContacts((prev) => prev.filter((c) => c._id !== confirmDelete.id));
      if (selectedId === confirmDelete.id) setSelectedId(null);
      setConfirmDelete({ open: false, id: null });
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Messages
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {contacts.length} total{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <Card padding={false} className="lg:col-span-1">
          <div className="p-4 border-b border-[var(--border-color)] space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search messages..."
            />
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-green-600 text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                  }`}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <HiInbox className="w-8 h-8 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  No messages
                </p>
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleSelect(c)}
                  className={`w-full text-left px-4 py-3 border-b border-[var(--border-color)] last:border-0 transition-colors ${
                    selectedId === c._id
                      ? 'bg-green-50 dark:bg-green-950/30'
                      : 'hover:bg-[var(--bg-secondary)]'
                  }`}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!c.isRead && (
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        )}
                        <p
                          className={`text-sm truncate ${
                            !c.isRead
                              ? 'font-semibold text-[var(--text-primary)]'
                              : 'font-medium text-[var(--text-primary)]'
                          }`}
                        >
                          {c.name}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {c.email}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                        {c.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                      {relativeTime(c.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {selected.name}
                  </h2>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-green-600 hover:underline"
                  >
                    {selected.email}
                  </a>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Received {formatDate(selected.createdAt, 'full')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selected.isArchived && (
                    <Badge variant="default">Archived</Badge>
                  )}
                  {!selected.isRead && (
                    <Badge variant="warning">New</Badge>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--border-color)] pt-4">
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="border-t border-[var(--border-color)] pt-4 flex gap-2 flex-wrap">
                <a href={`mailto:${selected.email}`}>
                  <Button size="sm" icon={<HiReply className="w-4 h-4" />}>
                    Reply
                  </Button>
                </a>
                {!selected.isArchived && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<HiArchive className="w-4 h-4" />}
                    onClick={() => handleArchive(selected._id)}
                    disabled={actionLoading}
                  >
                    Archive
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  icon={<HiTrash className="w-4 h-4" />}
                  onClick={() =>
                    setConfirmDelete({ open: true, id: selected._id })
                  }
                  disabled={actionLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <HiMail className="w-12 h-12 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">
                Select a message to read
              </p>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Permanently delete this message? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}