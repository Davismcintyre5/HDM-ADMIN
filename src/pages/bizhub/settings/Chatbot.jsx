import { useEffect, useState } from 'react';
import { getChatbotSettings, updateChatbotSettings } from '../../../services/bizhub/chatbot';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';
import Card from '../../../components/bizhub/ui/Card';

export default function ChatbotSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getChatbotSettings().then(res => setSettings(res.data || res)).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const updateKnowledge = (i, field, value) => {
    setSettings(prev => {
      const kb = [...(prev.knowledgeBase || [])];
      kb[i] = { ...kb[i], [field]: value };
      return { ...prev, knowledgeBase: kb };
    });
  };

  const addKnowledge = () => {
    setSettings(prev => ({ ...prev, knowledgeBase: [...(prev.knowledgeBase || []), { keywords: '', answer: '', active: true }] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updateChatbotSettings(settings); alert('Chatbot settings saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Chatbot Configuration</h3>
        <div className="space-y-4">
          <Toggle label="Enable Chatbot" checked={settings.enabled || false} onChange={(v) => updateField('enabled', v)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Position</label>
              <select value={settings.position || 'bottom-right'} onChange={(e) => updateField('position', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.primaryColor || '#f97316'} onChange={(e) => updateField('primaryColor', e.target.value)} className="h-10 w-16 rounded border cursor-pointer" />
                <Input value={settings.primaryColor || ''} onChange={(e) => updateField('primaryColor', e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>
          <Input label="Welcome Message" value={settings.welcomeMessage || ''} onChange={(e) => updateField('welcomeMessage', e.target.value)} />
          <Input label="Fallback Message" value={settings.fallbackMessage || ''} onChange={(e) => updateField('fallbackMessage', e.target.value)} />
          <Input label="WhatsApp Number" value={settings.whatsappNumber || ''} onChange={(e) => updateField('whatsappNumber', e.target.value)} />
          <Input label="Support Email" value={settings.supportEmail || ''} onChange={(e) => updateField('supportEmail', e.target.value)} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Knowledge Base</h3>
          <Button size="sm" variant="outline" onClick={addKnowledge}>+ Add Entry</Button>
        </div>
        <div className="space-y-3">
          {(settings.knowledgeBase || []).map((kb, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <Input label="Keywords" value={kb.keywords || ''} onChange={(e) => updateKnowledge(i, 'keywords', e.target.value)} placeholder="price, cost, how much" />
              <Input label="Answer" value={kb.answer || ''} onChange={(e) => updateKnowledge(i, 'answer', e.target.value)} placeholder="Plans start from KES 1,000/month." />
              <Toggle label="Active" checked={kb.active !== false} onChange={(v) => updateKnowledge(i, 'active', v)} />
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} loading={saving}>Save Chatbot Settings</Button>
    </div>
  );
}