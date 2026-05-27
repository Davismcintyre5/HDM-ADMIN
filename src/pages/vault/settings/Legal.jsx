import { useEffect, useState } from 'react';
import { getLegalDocs, getLegalDoc, saveLegalDoc, publishLegalDoc } from '../../../services/vault/legal';
import Card from '../../../components/vault/ui/Card';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Badge from '../../../components/vault/ui/Badge';
import { LEGAL_TYPES } from '../../../utils/vault/constants';
import { formatDate } from '../../../utils/vault/formatDate';

export default function LegalSettings() {
  const [docs, setDocs] = useState([]);
  const [activeType, setActiveType] = useState('terms');
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    getLegalDocs()
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeType) {
      getLegalDoc(activeType)
        .then(d => {
          setDoc(d);
          setContent(d.draftContent || d.publishedContent || '');
        })
        .catch(console.error);
    }
  }, [activeType]);

  const currentDoc = docs.find(d => d.type === activeType);

  const handleSave = async () => {
    setSaving(true);
    try { await saveLegalDoc(activeType, { content }); alert('Draft saved'); }
    catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const v = currentDoc?.versions?.length || 0;
      await publishLegalDoc(activeType, `v1.${v + 1}`);
      alert('Published!');
      const d = await getLegalDoc(activeType);
      setDoc(d);
      setContent(d.publishedContent || d.draftContent || '');
    } catch (err) { alert(err.message); }
    setPublishing(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {LEGAL_TYPES.map(t => (
          <Button key={t} size="sm" variant={activeType === t ? 'primary' : 'secondary'} onClick={() => setActiveType(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (HTML)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-orange-500 resize-y font-mono text-sm"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleSave} loading={saving}>Save Draft</Button>
            <Button onClick={handlePublish} loading={publishing}>Publish</Button>
          </div>
        </div>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentDoc?.publishedContent ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-[var(--text-primary)]">{currentDoc?.publishedContent ? '🟢 Published' : '🟡 Draft'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Version:</span>
              <span className="text-[var(--text-primary)]">{currentDoc?.currentVersion || 'v1.0'}</span>
            </div>
            {currentDoc?.publishedAt && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Published:</span>
                <span className="text-[var(--text-primary)]">{formatDate(currentDoc.publishedAt)}</span>
              </div>
            )}
          </div>
{currentDoc?.versions?.length > 0 && (
  <div className="mt-4">
    <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">
      History ({currentDoc.versions.length})
    </h4>
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {[...currentDoc.versions].reverse().map((v, i) => (
        <button
          key={i}
          onClick={() => setContent(v.content)}
          className={`w-full text-left text-xs p-2 rounded transition-colors ${
            content === v.content
              ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              : 'bg-[var(--bg-secondary)] hover:bg-[var(--sidebar-hover)]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-[var(--text-primary)]">{v.version}</span>
            <span className="text-[var(--text-muted)]">{formatDate(v.publishedAt, 'DD/MM/YYYY HH:mm')}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
)}
         
        </Card>
      </div>
    </div>
  );
}