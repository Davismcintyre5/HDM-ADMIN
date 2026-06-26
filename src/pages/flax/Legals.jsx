import { useEffect, useState } from 'react';
import { getLegal, saveLegal } from '../../services/flax/legals';
import Card from '../../components/flax/ui/Card';
import Input from '../../components/flax/ui/Input';
import Button from '../../components/flax/ui/Button';
import Spinner from '../../components/flax/ui/Spinner';

const TYPES = [
  { key: 'terms', label: 'Terms' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'refund', label: 'Refund' },
  { key: 'kyc', label: 'KYC' },
];

export default function Legals() {
  const [activeType, setActiveType] = useState('terms');
  const [legal, setLegal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', version: '' });

  useEffect(() => {
    setLoading(true);
    getLegal(activeType)
      .then((res) => {
        const d = res?.data?.legal || res?.legal || {};
        setLegal(d);
        setForm({ title: d.title || '', content: d.content || '', version: d.version || '' });
      })
      .catch(() => setLegal(null))
      .finally(() => setLoading(false));
  }, [activeType]);

  const handleSave = async () => {
    setSaving(true);
    try { await saveLegal(activeType, form); alert('Saved!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Legal Documents</h1>

      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setActiveType(t.key)}
            className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${activeType === t.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner size="md" /></div> : (
        <Card className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y text-sm" />
          </div>
          {legal?.publishedAt && <p className="text-xs text-[var(--text-muted)]">Published: {new Date(legal.publishedAt).toLocaleDateString()}</p>}
          {legal?.attachmentUrl && <a href={legal.attachmentUrl} target="_blank" className="text-sm text-blue-600 hover:underline">Download Attachment (PDF)</a>}
          <Button onClick={handleSave} loading={saving}>Save {TYPES.find(t => t.key === activeType)?.label}</Button>
        </Card>
      )}
    </div>
  );
}