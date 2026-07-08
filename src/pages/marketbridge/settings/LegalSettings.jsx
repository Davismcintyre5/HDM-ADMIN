import { useState } from 'react';
import Card from '../../../components/marketbridge/ui/Card';
import Button from '../../../components/marketbridge/ui/Button';

const DOCS = [
  { key: 'legal_terms', title: 'Terms & Conditions' },
  { key: 'legal_privacy', title: 'Privacy Policy' },
  { key: 'legal_refund', title: 'Refund & Return Policy' },
  { key: 'legal_cookie', title: 'Cookie Policy' },
  { key: 'legal_license', title: 'License Agreement' },
  { key: 'legal_store_terms', title: 'Store Terms & Conditions' },
  { key: 'legal_store_privacy', title: 'Store Privacy Policy' },
];

export default function LegalSettings({ settings, onSave, saving }) {
  const [editor, setEditor] = useState({ open: false, key: '', title: '', content: '' });

  const getVal = (key) => settings[key] || '';

  return (
    <div className="space-y-6 max-w-3xl">
      {DOCS.map(doc => (
        <Card key={doc.key}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[var(--text-primary)]">{doc.title}</h2>
            <Button size="sm" variant="secondary" onClick={() => setEditor({ open: true, key: doc.key, title: doc.title, content: getVal(doc.key) })}>
              Edit
            </Button>
          </div>
          <div className="text-xs text-[var(--text-muted)] max-h-20 overflow-hidden">
            {getVal(doc.key) ? getVal(doc.key).slice(0, 200) + '...' : 'No content yet.'}
          </div>
        </Card>
      ))}

      {editor.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Edit — {editor.title}</h3>
              <button onClick={() => setEditor({ open: false, key: '', title: '', content: '' })} className="p-1 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <textarea
                value={editor.content}
                onChange={e => setEditor({ ...editor, content: e.target.value })}
                className="w-full h-full min-h-[400px] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] rounded-lg p-4 font-mono text-sm resize-none"
                placeholder="Enter HTML content..."
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-[var(--border-color)]">
              <Button variant="secondary" onClick={() => setEditor({ open: false, key: '', title: '', content: '' })}>Cancel</Button>
              <Button onClick={() => { onSave(editor.key, editor.content); setEditor({ open: false, key: '', title: '', content: '' }); }} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}