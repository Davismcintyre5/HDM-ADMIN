import { useState, useEffect } from 'react';
import { getLegalDocs, getLegalDoc, updateLegalDoc } from '../../../services/bizhub/legal';
import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';

const TYPES = ['terms', 'privacy', 'refund', 'cookies', 'disclaimer'];

export default function LegalSettings({ onSave, saving }) {
  const [docs, setDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState({ open: false, type: '', title: '', content: '', version: '' });
  const [editorLoading, setEditorLoading] = useState(false);

  useEffect(() => {
    getLegalDocs()
      .then(res => {
        const d = res?.data || res || [];
        const map = {};
        (Array.isArray(d) ? d : []).forEach(doc => { map[doc.type] = doc; });
        setDocs(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openEditor = async (type) => {
    const existing = docs[type] || {};
    setEditor({ open: true, type, title: existing.title || '', content: '', version: existing.version || '1.0' });
    setEditorLoading(true);
    try {
      const res = await getLegalDoc(type);
      const doc = res?.data || res || {};
      setEditor({ open: true, type, title: doc.title || existing.title || '', content: doc.content || '', version: doc.version || existing.version || '1.0' });
    } catch (e) {
      // Use existing data
      setEditor({ open: true, type, title: existing.title || '', content: existing.content || '', version: existing.version || '1.0' });
    }
    setEditorLoading(false);
  };

  const handleSave = async () => {
    try {
      await updateLegalDoc(editor.type, {
        title: editor.title,
        content: editor.content,
        version: editor.version,
      });
      setDocs(prev => ({
        ...prev,
        [editor.type]: { ...prev[editor.type], title: editor.title, content: editor.content, version: editor.version },
      }));
      setEditor({ open: false, type: '', title: '', content: '', version: '' });
      alert('Saved!');
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {TYPES.map(type => {
        const doc = docs[type] || {};
        return (
          <Card key={type}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)] capitalize">{type.replace('_', ' ')}</h2>
                {doc.status && (
                  <span className="text-xs text-[var(--text-muted)]">Status: {doc.status} • Version: {doc.version || '—'}</span>
                )}
              </div>
              <Button size="sm" variant="secondary" onClick={() => openEditor(type)}>Edit</Button>
            </div>
            {doc.content ? (
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{doc.content.slice(0, 200)}...</p>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">No content yet. Click Edit to add.</p>
            )}
          </Card>
        );
      })}

      {/* Editor Modal */}
      {editor.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--text-primary)] capitalize">Edit — {editor.type.replace('_', ' ')}</h3>
              <button onClick={() => setEditor({ open: false, type: '', title: '', content: '', version: '' })} className="p-1 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]">✕</button>
            </div>
            {editorLoading ? (
              <div className="flex justify-center py-20"><Spinner size="md" /></div>
            ) : (
              <div className="flex-1 p-4 overflow-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Title" value={editor.title} onChange={e => setEditor({ ...editor, title: e.target.value })} />
                  <Input label="Version" value={editor.version} onChange={e => setEditor({ ...editor, version: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown/HTML)</label>
                  <textarea
                    value={editor.content}
                    onChange={e => setEditor({ ...editor, content: e.target.value })}
                    rows={16}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y font-mono text-sm"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 p-4 border-t border-[var(--border-color)]">
              <Button variant="secondary" onClick={() => setEditor({ open: false, type: '', title: '', content: '', version: '' })}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}