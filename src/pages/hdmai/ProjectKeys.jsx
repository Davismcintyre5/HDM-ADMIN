import { useState, useEffect } from 'react';
import { getProjectKeys, createProjectKey, revokeProjectKey } from '../../services/hdmai/keys';
import Card from '../../components/hdmai/ui/Card';
import Table from '../../components/hdmai/ui/Table';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Input from '../../components/hdmai/ui/Input';
import Modal from '../../components/hdmai/ui/Modal';
import ConfirmDialog from '../../components/hdmai/ui/ConfirmDialog';
import Pagination from '../../components/hdmai/ui/Pagination';
import { formatDate } from '../../utils/hdmai/formatDate';
import { HiPlus, HiClipboardCopy, HiTrash, HiUser, HiServer } from 'react-icons/hi';

const PROJECTS = ['general', 'erp', 'smartpos', 'spark', 'vibe', 'vault', 'widget'];
const TABS = [
  { key: 'user', label: 'User Keys', icon: HiUser },
  { key: 'system', label: 'System Keys', icon: HiServer },
];

export default function ProjectKeys() {
  const [allKeys, setAllKeys] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('user');

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ userId: '', project: 'general', name: '' });

  // Reveal key
  const [revealModal, setRevealModal] = useState({ open: false, key: '' });
  const [copied, setCopied] = useState(false);

  // Delete
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });

  const fetchKeys = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (projectFilter) params.project = projectFilter;
    if (search) params.search = search;
    getProjectKeys(params)
      .then(res => {
        const d = res?.data || res;
        setAllKeys(d.keys || []);
        setPagination(d.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, [page, projectFilter, search]);

  // Filter by tab
  const keys = activeTab === 'system'
    ? allKeys.filter(k => !k.userId || k.userId === null)
    : allKeys.filter(k => k.userId && k.userId !== null);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return alert('Please enter a name');
    setActionLoading(true);
    try {
      const res = await createProjectKey(createForm);
      const d = res?.data || res;
      setCreateModal(false);
      setCreateForm({ userId: '', project: 'general', name: '' });
      setRevealModal({ open: true, key: d.key || d.apiKey || 'Key created' });
      fetchKeys();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

const handleDelete = async () => {
  setActionLoading(true);
  try { await revokeProjectKey(confirm.id); fetchKeys(); } catch (err) { alert(err.message); }
  setActionLoading(false);
  setConfirm({ open: false, id: null, name: '' });
};

  const copyKey = () => {
    navigator.clipboard.writeText(revealModal.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns = [
    { key: 'project', label: 'Project', render: row => <Badge variant="fuchsia">{row.project || 'N/A'}</Badge> },
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-[var(--text-primary)]">{row.name || 'N/A'}</span> },
    ...(activeTab === 'user' ? [{
      key: 'userId',
      label: 'User',
      render: row => <span className="text-sm text-[var(--text-primary)]">{row.userId?.email || row.userId?.username || 'N/A'}</span>,
    }] : []),
    { key: 'keyPrefix', label: 'Prefix', render: row => <span className="text-xs font-mono text-[var(--text-secondary)]">{row.keyPrefix || '—'}</span> },
    { key: 'createdAt', label: 'Created', render: row => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, name: row.name })}>
          <HiTrash className="w-4 h-4" /> Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Project Keys</h1>
        <Button onClick={() => setCreateModal(true)}><HiPlus className="w-4 h-4 mr-1" /> Create Key</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-fuchsia-600 text-fuchsia-600 dark:text-fuchsia-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="text-xs text-[var(--text-muted)]">
              ({activeTab === 'system' ? allKeys.filter(k => !k.userId).length : allKeys.filter(k => k.userId).length})
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={projectFilter}
          onChange={e => { setProjectFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
        >
          <option value="">All Projects</option>
          {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name..."
          className="flex-1"
        />
      </div>

      <Card>
        <Table columns={columns} data={keys} loading={loading} emptyMessage={`No ${activeTab} keys found.`} />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Project Key" size="lg">
        <div className="space-y-4">
          <Input label="User ID" value={createForm.userId} onChange={e => setCreateForm({ ...createForm, userId: e.target.value })} placeholder="Leave empty for system key" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project</label>
            <select value={createForm.project} onChange={e => setCreateForm({ ...createForm, project: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Input label="Name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="My App Key" required />
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={actionLoading}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Reveal Key */}
      <Modal open={revealModal.open} onClose={() => { setRevealModal({ open: false, key: '' }); setCopied(false); }} title="Key Created!" size="lg">
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Copy this key now. It will not be shown again.</p>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 font-mono text-sm text-[var(--text-primary)] break-all select-all">{revealModal.key}</div>
          <Button onClick={copyKey} variant={copied ? 'success' : 'primary'}><HiClipboardCopy className="w-4 h-4 mr-1" /> {copied ? 'Copied!' : 'Copy'}</Button>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">⚠️ This key will not be shown again.</p>
          <div className="pt-2"><Button variant="secondary" onClick={() => { setRevealModal({ open: false, key: '' }); setCopied(false); }}>Done</Button></div>
        </div>
      </Modal>

      {/* Delete */}
      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Key" message={`Permanently delete "${confirm.name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}