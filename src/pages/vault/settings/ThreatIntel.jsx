import { useEffect, useState } from 'react';
import { getSettings, updateThreatIntel } from '../../../services/vault/settings';
import Input from '../../../components/vault/ui/Input';
import Toggle from '../../../components/vault/ui/Toggle';
import Button from '../../../components/vault/ui/Button';
import Spinner from '../../../components/vault/ui/Spinner';
import Badge from '../../../components/vault/ui/Badge';
import { HiPlus, HiX } from 'react-icons/hi';

export default function ThreatIntelSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlock, setNewBlock] = useState('');

  useEffect(() => { getSettings().then(s => setSettings(s.settings || s)).catch(console.error).finally(() => setLoading(false)); }, []);

  const addBlock = () => {
    if (!newBlock.trim()) return;
    setSettings(prev => ({ ...prev, customBlocklist: [...(prev.customBlocklist || []), newBlock.trim()] }));
    setNewBlock('');
  };

  const removeBlock = (item) => {
    setSettings(prev => ({ ...prev, customBlocklist: prev.customBlocklist.filter(b => b !== item) }));
  };

  const updateFeed = (key, value) => setSettings(prev => ({ ...prev, feedSources: { ...prev.feedSources, [key]: value } }));
  const handleSave = async () => { setSaving(true); try { await updateThreatIntel(settings); alert('Saved'); } catch (err) { alert(err.message); } setSaving(false); };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold mb-3">Custom Blocklist</h3>
        <div className="flex gap-2 mb-3">
          <input value={newBlock} onChange={(e) => setNewBlock(e.target.value)} placeholder="Add domain or URL..."
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" onKeyDown={(e) => e.key === 'Enter' && addBlock()} />
          <Button size="sm" onClick={addBlock}><HiPlus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(settings.customBlocklist || []).map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 text-xs">
              {b} <button onClick={() => removeBlock(b)}><HiX className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Feed Sources</h3>
        <Toggle label="URLhaus" checked={settings.feedSources?.urlhaus || false} onChange={(v) => updateFeed('urlhaus', v)} />
      </div>
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </div>
  );
}