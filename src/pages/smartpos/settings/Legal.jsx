import { useEffect, useState } from 'react';
import { getAllContent, saveContent } from '../../../services/smartpos/content';
import Button from '../../../components/smartpos/ui/Button';
import Input from '../../../components/smartpos/ui/Input';
import Spinner from '../../../components/smartpos/ui/Spinner';

const LEGAL_SECTIONS = ['terms', 'privacy', 'cookies'];

export default function LegalSettings() {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    getAllContent()
      .then(res => {
        const docs = {};
        (res.content || []).forEach(item => {
          if (LEGAL_SECTIONS.includes(item.section)) {
            docs[item.section] = { title: item.title || '', body: item.body || '' };
          }
        });
        LEGAL_SECTIONS.forEach(s => { if (!docs[s]) docs[s] = { title: s.charAt(0).toUpperCase() + s.slice(1), body: '' }; });
        setDocuments(docs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateDoc = (section, field, value) => {
    setDocuments(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      await saveContent(section, { title: documents[section].title, body: documents[section].body, active: true });
      alert(`${section} saved`);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  const current = documents[activeTab];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {LEGAL_SECTIONS.map(s => (
          <Button key={s} size="sm" variant={activeTab === s ? 'primary' : 'secondary'} onClick={() => setActiveTab(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>
      {current && (
        <div className="space-y-4 max-w-3xl">
          <Input label="Title" value={current.title || ''} onChange={(e) => updateDoc(activeTab, 'title', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Body (HTML)</label>
            <textarea value={current.body || ''} onChange={(e) => updateDoc(activeTab, 'body', e.target.value)} rows={15}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm" />
          </div>
          <Button onClick={() => handleSave(activeTab)} loading={saving}>Save {activeTab}</Button>
        </div>
      )}
    </div>
  );
}