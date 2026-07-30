import { useState, useEffect } from 'react';
import { getSupport, updateSupport } from '../../services/hdmai/support';
import Card from '../../components/hdmai/ui/Card';
import Input from '../../components/hdmai/ui/Input';
import Button from '../../components/hdmai/ui/Button';
import Spinner from '../../components/hdmai/ui/Spinner';
import { HiPlus, HiTrash } from 'react-icons/hi';

export default function Support() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

useEffect(() => {
  getSupport()
    .then(res => {
            setData(res?.data || res || {});
    })
    .catch(err => {
           setData(null);
    })
    .finally(() => setLoading(false));
}, []);

  const handleSave = async () => {
    setSaving(true); setSuccess('');
    try {
      await updateSupport(data);
      setSuccess('Saved!'); setTimeout(() => setSuccess(''), 2000);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const updateField = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const addFaq = () => {
    const faq = [...(data.faq || []), { question: '', answer: '' }];
    updateField('faq', faq);
  };

  const removeFaq = (index) => {
    const faq = (data.faq || []).filter((_, i) => i !== index);
    updateField('faq', faq);
  };

  const updateFaq = (index, field, value) => {
    const faq = [...(data.faq || [])];
    faq[index] = { ...faq[index], [field]: value };
    updateField('faq', faq);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <div className="text-center py-20 text-[var(--text-muted)]">Failed to load support content.</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Support Page</h1>
        <Button onClick={handleSave} loading={saving} size="lg">Save All Changes</Button>
      </div>
      {success && <div className="bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}

      {/* Contact Info */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Contact Info</h2>
        <div className="space-y-4">
          <Input label="Support Email" type="email" value={data.supportEmail || ''} onChange={e => updateField('supportEmail', e.target.value)} placeholder="info@hdmdevelopers.com" />
          <Input label="Support Phone" value={data.supportPhone || ''} onChange={e => updateField('supportPhone', e.target.value)} placeholder="+254 768 784 909" />
          <Input label="Support WhatsApp" value={data.supportWhatsApp || ''} onChange={e => updateField('supportWhatsApp', e.target.value)} placeholder="+254 768 784 909" />
        </div>
      </Card>

     {/* Links */}
<Card className="mb-6">
  <h2 className="font-semibold text-[var(--text-primary)] mb-4">Links</h2>
  <div className="space-y-4">
    <Input label="App Download URL" value={data.appDownloadUrl || ''} onChange={e => updateField('appDownloadUrl', e.target.value)} placeholder="https://hdmai.pxxl.click/download" />
    <Input label="Documentation URL" value={data.docsUrl || ''} onChange={e => updateField('docsUrl', e.target.value)} placeholder="https://hdmai.pxxl.click/docs" />
  </div>
</Card>

      {/* FAQ */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">FAQ</h2>
        <div className="space-y-4">
          {(data.faq || []).map((item, index) => (
            <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-secondary)]">FAQ #{index + 1}</span>
                <Button size="sm" variant="danger" onClick={() => removeFaq(index)}><HiTrash className="w-4 h-4" /></Button>
              </div>
              <Input label="Question" value={item.question || ''} onChange={e => updateFaq(index, 'question', e.target.value)} placeholder="How do I create an API key?" />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Answer</label>
                <textarea value={item.answer || ''} onChange={e => updateFaq(index, 'answer', e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y"
                  placeholder="Go to Settings > API Keys..." />
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={addFaq} className="w-full"><HiPlus className="w-4 h-4 mr-1" /> Add FAQ</Button>
        </div>
      </Card>

      {/* API Integration Guide */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">API Integration Guide</h2>
        <textarea value={data.apiGuide || ''} onChange={e => updateField('apiGuide', e.target.value)} rows={12}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y font-mono"
          placeholder="# API Integration Guide&#10;&#10;Use the Public Chat API to integrate HDM AI..." />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save All Changes</Button>
      </div>
    </div>
  );
}