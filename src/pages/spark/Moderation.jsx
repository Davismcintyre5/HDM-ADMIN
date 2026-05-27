import { useState, useEffect } from 'react';
import { getFlaggedMessages, removeContent, bulkRemoveUserContent, warnUser, getBlockedWords, addBlockedWord, deleteBlockedWord } from '../../services/spark/moderation';
import Card from '../../components/spark/ui/Card';
import Table from '../../components/spark/ui/Table';
import Badge from '../../components/spark/ui/Badge';
import Button from '../../components/spark/ui/Button';
import Modal from '../../components/spark/ui/Modal';
import Input from '../../components/spark/ui/Input';
import Pagination from '../../components/spark/ui/Pagination';
import ConfirmDialog from '../../components/spark/ui/ConfirmDialog';
import { formatDate } from '../../utils/spark/formatDate';
import { HiTrash, HiExclamation, HiPlus, HiX } from 'react-icons/hi';

export default function Moderation() {
  const [messages, setMessages] = useState({ data: [], meta: {} });
  const [blockedWords, setBlockedWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [warnModal, setWarnModal] = useState({ open: false, userId: null });
  const [warnForm, setWarnForm] = useState({ type: 'inappropriate_content', message: '', severity: 'medium' });
  const [newWord, setNewWord] = useState('');
  const [confirmAction, setConfirmAction] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getFlaggedMessages({ page, limit: 20 }), getBlockedWords()])
      .then(([msgRes, words]) => { setMessages({ data: msgRes.data || [], meta: msgRes.meta || {} }); setBlockedWords(words || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const handleRemove = async () => {
    setActionLoading(true);
    try { await removeContent(confirmAction.id, { contentType: 'message', reason: 'Violation' }); setConfirmAction({ open: false, id: null, type: '' }); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleBulkRemove = async (userId) => {
    if (!window.confirm('Remove ALL content from this user?')) return;
    try { await bulkRemoveUserContent(userId); } catch (err) { alert(err.message); }
  };

  const handleWarn = async () => {
    setActionLoading(true);
    try { await warnUser(warnModal.userId, warnForm); setWarnModal({ open: false, userId: null }); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    try { await addBlockedWord(newWord.trim()); setNewWord(''); const words = await getBlockedWords(); setBlockedWords(words || []); }
    catch (err) { alert(err.message); }
  };

  const handleDeleteWord = async (word) => {
    try { await deleteBlockedWord(word); const words = await getBlockedWords(); setBlockedWords(words || []); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'content', label: 'Message', render: (row) => <span className="truncate max-w-xs block">{row.content || row.text}</span> },
    { key: 'reason', label: 'Reason', render: (row) => <Badge variant="danger">{row.reason || 'Flagged'}</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="warning" onClick={() => setWarnModal({ open: true, userId: row.userId || row.user?._id })}><HiExclamation className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmAction({ open: true, id: row._id || row.id, type: 'remove' })}><HiTrash className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => handleBulkRemove(row.userId || row.user?._id)}>All</Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Moderation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="font-semibold mb-4">Flagged Messages</h2>
            <Table columns={columns} data={messages.data} loading={loading} emptyMessage="No flagged messages." />
            <Pagination page={page} totalPages={messages.meta?.totalPages || 1} onPageChange={setPage} />
          </Card>
        </div>
        <Card>
          <h2 className="font-semibold mb-4">Blocked Words</h2>
          <div className="flex gap-2 mb-3">
            <input type="text" value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Add word..." className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddWord()} />
            <Button size="sm" onClick={handleAddWord}><HiPlus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockedWords.map(w => (
              <span key={w} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs">
                {w}
                <button onClick={() => handleDeleteWord(w)} className="hover:text-red-900"><HiX className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={warnModal.open} onClose={() => setWarnModal({ open: false, userId: null })} title="Warn User" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={warnForm.type} onChange={(e) => setWarnForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)]">
              <option value="spam">Spam</option><option value="harassment">Harassment</option><option value="inappropriate_content">Inappropriate Content</option><option value="terms_violation">Terms Violation</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Severity</label>
            <select value={warnForm.severity} onChange={(e) => setWarnForm(p => ({ ...p, severity: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)]">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <Input label="Message" value={warnForm.message} onChange={(e) => setWarnForm(p => ({ ...p, message: e.target.value }))} placeholder="Warning message" />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setWarnModal({ open: false, userId: null })}>Cancel</Button><Button variant="warning" onClick={handleWarn} loading={actionLoading}>Send Warning</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmAction.open} onClose={() => setConfirmAction({ open: false, id: null, type: '' })} title="Remove Content" message="Remove this content?" confirmLabel="Remove" variant="danger" onConfirm={handleRemove} loading={actionLoading} />
    </div>
  );
}