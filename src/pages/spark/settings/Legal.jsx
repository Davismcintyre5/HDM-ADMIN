import { useEffect, useState } from 'react';
import { getLegalDocs, saveLegalDoc, getLegalHistory } from '../../../services/spark/legal';
import Card from '../../../components/spark/ui/Card';
import Button from '../../../components/spark/ui/Button';
import Input from '../../../components/spark/ui/Input';
import Modal from '../../../components/spark/ui/Modal';
import Badge from '../../../components/spark/ui/Badge';
import Spinner from '../../../components/spark/ui/Spinner';
import ConfirmDialog from '../../../components/spark/ui/ConfirmDialog';
import { LEGAL_TYPES } from '../../../utils/spark/constants';
import { formatDate } from '../../../utils/spark/formatDate';

export default function LegalSettings() {
  const [docs, setDocs] = useState({});
  const [activeType, setActiveType] = useState('terms');
  const [form, setForm] = useState({ title: '', content: '', isPublished: false, notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyModal, setHistoryModal] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    getLegalDocs()
      .then(d => {
        const map = {};
        (d || []).forEach(doc => { map[doc.type] = doc; });
        setDocs(map);
        if (map[activeType]) {
          setForm({
            title: map[activeType].title || '',
            content: map[activeType].content || '',
            isPublished: map[activeType].isPublished || false,
            notes: ''
          });
        } else {
          setForm({
            title: activeType.charAt(0).toUpperCase() + activeType.slice(1).replace(/_/g, ' '),
            content: '',
            isPublished: false,
            notes: ''
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const switchType = (type) => {
    setActiveType(type);
    if (docs[type]) {
      setForm({
        title: docs[type].title || '',
        content: docs[type].content || '',
        isPublished: docs[type].isPublished || false,
        notes: ''
      });
    } else {
      setForm({
        title: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
        content: '',
        isPublished: false,
        notes: ''
      });
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const res = await saveLegalDoc(activeType, { ...form, isPublished: publish });
      const newDoc = res.data || res;
      setDocs(prev => ({ ...prev, [activeType]: { ...newDoc, type: activeType } }));
      setForm(prev => ({ ...prev, notes: '', isPublished: newDoc.isPublished || false }));
      if (confirmPublish) setConfirmPublish(false);
      alert(publish ? 'Published!' : 'Draft saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const loadHistory = async () => {
    try {
      const h = await getLegalHistory(activeType);
      setHistory(h || []);
      setHistoryModal(true);
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {LEGAL_TYPES.map(t => (
          <Button
            key={t}
            size="sm"
            variant={activeType === t ? 'primary' : 'secondary'}
            onClick={() => switchType(t)}
          >
            {t.replace(/_/g, ' ').replace(/^./, s => s.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Content (HTML)
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
              rows={18}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 resize-y font-mono text-sm"
            />
          </div>
          <Input
            label="Notes (saved in version history)"
            value={form.notes}
            onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => handleSave(false)} loading={saving}>
              Save Draft
            </Button>
            <Button onClick={() => setConfirmPublish(true)}>Publish</Button>
          </div>
        </div>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${docs[activeType]?.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-[var(--text-primary)]">
                {docs[activeType]?.isPublished ? '🟢 Published' : '🟡 Draft'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Version:</span>
              <span className="text-[var(--text-primary)]">{docs[activeType]?.version || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Updated:</span>
              <span className="text-[var(--text-primary)]">{formatDate(docs[activeType]?.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Created:</span>
              <span className="text-[var(--text-primary)]">{formatDate(docs[activeType]?.createdAt)}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={loadHistory}>
            View Version History
          </Button>
        </Card>
      </div>

      <Modal open={historyModal} onClose={() => setHistoryModal(false)} title="Version History" size="lg">
        <div className="space-y-3">
          {history.length > 0 ? history.map((h, i) => (
            <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-[var(--text-primary)]">Version {h.version || i + 1}</span>
                <span className="text-[var(--text-muted)] text-xs">{formatDate(h.createdAt || h.timestamp, 'full')}</span>
              </div>
              <p className="text-[var(--text-muted)] text-xs mt-1">{h.notes || 'No notes'}</p>
            </div>
          )) : (
            <p className="text-[var(--text-muted)] text-sm text-center py-4">No version history yet. Save a draft to create the first version.</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        title="Publish Document"
        message={`Make "${form.title}" live to the public? This will overwrite the currently published version.`}
        confirmLabel="Publish"
        variant="success"
        onConfirm={() => handleSave(true)}
        loading={saving}
      />
    </div>
  );
}