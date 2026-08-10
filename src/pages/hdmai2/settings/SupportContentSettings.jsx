import { useState, useEffect } from 'react';
import { getSupportContent, createSupportContent, updateSupportContent, deleteSupportContent } from '../../../services/hdmai2/supportContent';
import Card from '../../../components/hdmai2/ui/Card';
import Badge from '../../../components/hdmai2/ui/Badge';
import Button from '../../../components/hdmai2/ui/Button';
import Input from '../../../components/hdmai2/ui/Input';
import Toggle from '../../../components/hdmai2/ui/Toggle';
import Modal from '../../../components/hdmai2/ui/Modal';
import ConfirmDialog from '../../../components/hdmai2/ui/ConfirmDialog';
import Spinner from '../../../components/hdmai2/ui/Spinner';
import { formatDate } from '../../../utils/hdmai2/formatDate';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const SUB_TABS = [
  { key: 'faq', label: 'FAQ' },
  { key: 'download', label: 'Downloads' },
  { key: 'api_guide', label: 'API Guide' },
];

export default function SupportContentSettings() {
  const [activeTab, setActiveTab] = useState('faq');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ type: '', title: '', content: {}, order: 0, status: 'active' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

const fetchItems = () => {
  setLoading(true);
  getSupportContent({ type: activeTab })
    .then(res => {
      const data = res?.data?.items || res?.data || [];
      setItems(Array.isArray(data) ? data : []);
    })
    .catch(console.error).finally(() => setLoading(false));
};

  useEffect(() => { fetchItems(); }, [activeTab]);

  const openCreate = () => {
    setForm({ type: activeTab, title: '', content: {}, order: items.length, status: 'active' });
    setModal({ open: true, mode: 'create', data: null });
  };
  const openEdit = (item) => { setForm(item); setModal({ open: true, mode: 'edit', data: item }); };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      if (modal.mode === 'create') await createSupportContent(form);
      else await updateSupportContent(modal.data._id, form);
      setModal({ open: false, mode: 'create', data: null }); fetchItems();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteSupportContent(confirmDelete.id); setConfirmDelete({ open: false, id: null, title: '' }); fetchItems(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="space-y-4">
            <Input label="Question" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Answer</label>
              <textarea value={form.content?.answer || ''} onChange={e => setForm({ ...form, content: { answer: e.target.value } })} rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y" required />
            </div>
            <Input label="Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} />
          </div>
        );
      case 'download':
        return (
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Android App" required />
            <Input label="URL" value={form.content?.url || ''} onChange={e => setForm({ ...form, content: { ...form.content, url: e.target.value } })} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Version" value={form.content?.version || ''} onChange={e => setForm({ ...form, content: { ...form.content, version: e.target.value } })} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Platform</label>
                <select value={form.content?.platform || 'android'} onChange={e => setForm({ ...form, content: { ...form.content, platform: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  {['android', 'ios', 'windows', 'macos', 'linux', 'web'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <Input label="Docs URL (optional)" value={form.content?.docsUrl || ''} onChange={e => setForm({ ...form, content: { ...form.content, docsUrl: e.target.value } })} />
            <Input label="Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} />
          </div>
        );
      case 'api_guide':
        return (
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="API Integration Guide" />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
              <textarea value={form.content?.text || ''} onChange={e => setForm({ ...form, content: { text: e.target.value } })} rows={12}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm font-mono resize-y" />
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Support Content</h2>
      </div>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add {activeTab === 'faq' ? 'FAQ' : activeTab === 'download' ? 'Download' : 'API Guide'}</Button>
      </div>

      {items.length === 0 ? (
        <Card><p className="text-sm text-[var(--text-muted)] text-center py-8">No {activeTab === 'faq' ? 'FAQs' : activeTab === 'download' ? 'downloads' : 'API guides'} yet.</p></Card>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <Card key={item._id} className="!p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[var(--text-primary)]">{item.title}</h3>
                    <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status}</Badge>
                  </div>
                  {activeTab === 'faq' && <p className="text-sm text-[var(--text-muted)]">{item.content?.answer}</p>}
                  {activeTab === 'download' && (
                    <div className="text-xs text-[var(--text-muted)] space-y-0.5">
                      {item.content?.version && <p>v{item.content.version} · {item.content?.platform}</p>}
                      {item.content?.url && <p className="truncate">{item.content.url}</p>}
                    </div>
                  )}
                  {activeTab === 'api_guide' && (
                    <p className="text-xs text-[var(--text-muted)]">Status: {item.status} · Updated: {formatDate(item.updatedAt || item.createdAt)}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(item)}><HiPencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: item._id, title: item.title })}><HiTrash className="w-3 h-3" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? `Add ${activeTab === 'faq' ? 'FAQ' : activeTab === 'download' ? 'Download' : 'API Guide'}` : 'Edit'} size="lg">
        <div className="space-y-4">
          {renderForm()}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['active', 'inactive'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, title: '' })} onConfirm={handleDelete}
        title="Delete Item" message={`Delete "${confirmDelete.title}"?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}