import { useEffect, useState } from 'react';
import { getApiKeys, createApiKey, updateApiKey, deleteApiKey, rotateApiKey } from '../../services/hdmai/apiKeys';
import Card from '../../components/hdmai/ui/Card';
import Table from '../../components/hdmai/ui/Table';
import Badge from '../../components/hdmai/ui/Badge';
import Button from '../../components/hdmai/ui/Button';
import Modal from '../../components/hdmai/ui/Modal';
import Input from '../../components/hdmai/ui/Input';
import SearchBar from '../../components/hdmai/ui/SearchBar';
import Pagination from '../../components/hdmai/ui/Pagination';
import ConfirmDialog from '../../components/hdmai/ui/ConfirmDialog';
import { formatDate } from '../../utils/hdmai/formatDate';
import { PROJECTS, PROJECT_LABELS } from '../../utils/hdmai/constants';
import { HiEye, HiTrash, HiRefresh, HiClipboardCopy } from 'react-icons/hi';

export default function ApiKeys() {
  const [data, setData] = useState({ keys: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [newKey, setNewKey] = useState({ user_id: '', project: 'general', name: '' });
  const [createdKey, setCreatedKey] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmRotate, setConfirmRotate] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKeys = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (project) params.project = project;
    if (status) params.status = status;
    getApiKeys(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, [page, project, status]);

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      const res = await createApiKey(newKey);
      setCreatedKey(res.data);
      setNewKey({ user_id: '', project: 'general', name: '' });
      fetchKeys();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteApiKey(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchKeys(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRotate = async () => {
    setActionLoading(true);
    try {
      const res = await rotateApiKey(confirmRotate.id);
      setCreatedKey(res.data);
      setConfirmRotate({ open: false, id: null });
      fetchKeys();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.name || 'Unnamed'}</span> },
    { key: 'project', label: 'Project', render: (row) => <Badge variant="fuchsia">{PROJECT_LABELS[row.project] || row.project}</Badge> },
    { key: 'user_email', label: 'User', render: (row) => row.user_email || row.user_id || 'N/A' },
    { key: 'is_active', label: 'Status', render: (row) => row.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Revoked</Badge> },
    { key: 'total_requests', label: 'Requests', render: (row) => row.total_requests?.toLocaleString() || 0 },
    { key: 'last_used', label: 'Last Used', render: (row) => row.last_used ? formatDate(row.last_used) : 'Never' },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setConfirmRotate({ open: true, id: row.id })} title="Rotate"><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row.id })} title="Delete"><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">API Keys</h1>
        <Button onClick={() => { setCreatedKey(null); setCreateModal(true); }}>Create Key</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={project} onChange={(e) => { setProject(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
          <option value="">All Projects</option>
          {PROJECTS.map(p => <option key={p} value={p}>{PROJECT_LABELS[p] || p}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
        <SearchBar value={search} onChange={setSearch} placeholder="Search keys..." />
      </div>

      <Card>
        <Table columns={columns} data={data.keys} loading={loading} emptyMessage="No API keys found." />
        <Pagination page={page} totalPages={data.pagination?.pages || 1} onPageChange={setPage} />
      </Card>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create API Key" size="md">
        {createdKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">⚠ Save this key now — it won't be shown again!</p>
              <code className="block bg-[var(--bg-tertiary)] p-3 rounded text-xs text-[var(--text-primary)] break-all select-all">{createdKey.full_key}</code>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { navigator.clipboard.writeText(createdKey.full_key); alert('Copied!'); }}>
                <HiClipboardCopy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <Button variant="secondary" onClick={() => { setCreateModal(false); setCreatedKey(null); }}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="User ID" value={newKey.user_id} onChange={(e) => setNewKey(prev => ({ ...prev, user_id: e.target.value }))} placeholder="64a1b2c3..." />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project</label>
              <select value={newKey.project} onChange={(e) => setNewKey(prev => ({ ...prev, project: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)]">
                {PROJECTS.map(p => <option key={p} value={p}>{PROJECT_LABELS[p] || p}</option>)}
              </select>
            </div>
            <Input label="Key Name" value={newKey.name} onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))} placeholder="Production Key" />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={actionLoading}>Create</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete API Key" message="Permanently delete this key? It cannot be recovered." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} loading={actionLoading} />
      <ConfirmDialog open={confirmRotate.open} onClose={() => setConfirmRotate({ open: false, id: null })} title="Rotate API Key" message="Revoke old key and generate a new one? The old key will be permanently deleted." confirmLabel="Rotate" variant="warning" onConfirm={handleRotate} loading={actionLoading} />
    </div>
  );
}