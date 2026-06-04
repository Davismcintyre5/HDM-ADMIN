import { useEffect, useState } from 'react';
import { getContent, updateContent } from '../../../services/bizhub/content';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

const SLUGS = ['terms', 'privacy', 'refund', 'acceptable-use', 'data-processing', 'cookie-policy', 'sla', 'disclaimer', 'copyright', 'gdpr'];

export default function LegalSettings() {
  const [activeSlug, setActiveSlug] = useState('terms');
  const [content, setContent] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getContent(`legal/${activeSlug}`)
      .then(res => setContent(res.data || res || { title: '', content: '' }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSlug]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateContent(`legal/${activeSlug}`, content); alert(`${activeSlug} saved`); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex gap-2 flex-wrap">
        {SLUGS.map(s => (
          <Button key={s} size="sm" variant={activeSlug === s ? 'primary' : 'secondary'} onClick={() => setActiveSlug(s)}>
            {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
              <input value={content.title || ''} onChange={(e) => setContent(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (HTML)</label>
              <textarea value={content.content || ''} onChange={(e) => setContent(p => ({ ...p, content: e.target.value }))} rows={18}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y font-mono text-sm" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>Save {activeSlug}</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}