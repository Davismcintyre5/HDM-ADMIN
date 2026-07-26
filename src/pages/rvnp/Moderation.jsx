import { useState, useEffect } from 'react';
import { getModerationQueue, approveContent, removeContent } from '../../services/rvnp/moderation';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiCheck, HiX, HiPhotograph, HiVideoCamera, HiTag } from 'react-icons/hi';

const typeIcons = { post: HiPhotograph, story: HiVideoCamera, listing: HiTag };

export default function Moderation() {
  const [queue, setQueue] = useState({ posts: [], stories: [], listings: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [removeModal, setRemoveModal] = useState({ open: false, id: null, type: '' });
  const [removeReason, setRemoveReason] = useState('');

  const fetchQueue = () => {
    setLoading(true);
    getModerationQueue().then(res => setQueue(res.data || { posts: [], stories: [], listings: [] })).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async (id, type) => {
    setActionLoading(true);
    try { await approveContent(id, { type }); fetchQueue(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleRemove = async () => {
    setActionLoading(true);
    try { await removeContent(removeModal.id, { type: removeModal.type, reason: removeReason }); setRemoveModal({ open: false, id: null, type: '' }); fetchQueue(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Moderation</h1>
      {Object.entries(queue).map(([type, items]) => (
        <div key={type} className="mb-8">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4 capitalize flex items-center gap-2">
            {type === 'posts' ? <HiPhotograph className="w-5 h-5" /> : type === 'stories' ? <HiVideoCamera className="w-5 h-5" /> : <HiTag className="w-5 h-5" />}
            {type} ({items.length})
          </h2>
          {items.length === 0 ? (
            <Card><p className="text-sm text-[var(--text-muted)] text-center py-4">No {type} to review.</p></Card>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <Card key={item._id} className="!p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-[var(--text-primary)]">{item.content || item.title || item._id}</p>
                      <p className="text-xs text-[var(--text-muted)]">by {item.user?.firstName} {item.user?.lastName} · {formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(item._id, type.slice(0, -1))}><HiCheck className="w-4 h-4" /></Button>
                      <Button size="sm" variant="danger" onClick={() => setRemoveModal({ open: true, id: item._id, type: type.slice(0, -1) })}><HiX className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
      <Modal open={removeModal.open} onClose={() => setRemoveModal({ open: false, id: null, type: '' })} title="Remove Content">
        <Input label="Reason" value={removeReason} onChange={e => setRemoveReason(e.target.value)} placeholder="Reason for removal" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setRemoveModal({ open: false, id: null, type: '' })}>Cancel</Button>
          <Button variant="danger" onClick={handleRemove} loading={actionLoading}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}