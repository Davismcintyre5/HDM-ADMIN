import { useState, useEffect } from 'react';
import { getLegalDocument, updateLegalDocument } from '../../services/hdmerp/legal';
import Card from '../../components/hdmerp/ui/Card';
import Button from '../../components/hdmerp/ui/Button';
import Input from '../../components/hdmerp/ui/Input';
import Spinner from '../../components/hdmerp/ui/Spinner';
import { LEGAL_TYPES } from '../../utils/hdmerp/constants';

export default function Legal() {
  const [type, setType] = useState(LEGAL_TYPES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getLegalDocument(type)
      .then(data => {
        setTitle(data.title || '');
        setContent(data.content || '');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [type]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLegalDocument(type, { title, content });
      alert('Document saved successfully');
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Legal Documents</h1>
      <Card>
        <div className="flex gap-2 mb-4 flex-wrap">
          {LEGAL_TYPES.map(t => (
            <Button
              key={t}
              variant={t === type ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setType(t)}
            >
              {t.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              />
            </div>
            <Button onClick={handleSave} loading={saving}>Save Document</Button>
          </div>
        )}
      </Card>
    </div>
  );
}