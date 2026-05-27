import { useEffect, useState } from 'react';
import { getAIConfig, updateAIConfig, toggleFeature, updateThresholds, updateRateLimits, updateAutoModeration, updateLanguages, updateLogging, resetToDefaults } from '../../../services/spark/aiConfig';
import Card from '../../../components/spark/ui/Card';
import Toggle from '../../../components/spark/ui/Toggle';
import Button from '../../../components/spark/ui/Button';
import Spinner from '../../../components/spark/ui/Spinner';
import ConfirmDialog from '../../../components/spark/ui/ConfirmDialog';
import { AI_FEATURES } from '../../../utils/spark/constants';

export default function AIConfigSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { getAIConfig().then(setConfig).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleToggleFeature = async (name, enabled) => {
    try { await toggleFeature(name, enabled); const c = await getAIConfig(); setConfig(c); } catch (err) { alert(err.message); }
  };

  const handleSave = async (section, data) => {
    setSaving(true);
    try {
      if (section === 'thresholds') await updateThresholds(data);
      else if (section === 'rateLimits') await updateRateLimits(data);
      else if (section === 'autoModeration') await updateAutoModeration(data);
      else if (section === 'languages') await updateLanguages(data);
      else if (section === 'logging') await updateLogging(data);
      else await updateAIConfig(data);
      alert('Saved');
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleReset = async () => { try { await resetToDefaults(); const c = await getAIConfig(); setConfig(c); setConfirmReset(false); } catch (err) { alert(err.message); } };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (!config) return null;

  const tabs = ['features', 'thresholds', 'rateLimits', 'autoModeration', 'languages', 'logging'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <Button key={t} size="sm" variant={activeTab === t ? 'primary' : 'secondary'} onClick={() => setActiveTab(t)}>
              {t.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            </Button>
          ))}
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>Reset to Defaults</Button>
      </div>

      {activeTab === 'features' && (
        <Card>
          <h3 className="font-semibold mb-4">AI Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AI_FEATURES.map(f => (
              <Toggle key={f} label={f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} checked={config.features?.[f] || false} onChange={(v) => handleToggleFeature(f, v)} />
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'thresholds' && (
        <Card>
          <h3 className="font-semibold mb-4">Thresholds (0.0 - 1.0)</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config.thresholds || {}).map(([k, v]) => (
              <div key={k}><label className="text-sm text-[var(--text-secondary)]">{k}</label><input type="number" step="0.1" min="0" max="1" value={v} onChange={(e) => setConfig(p => ({ ...p, thresholds: { ...p.thresholds, [k]: parseFloat(e.target.value) } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" /></div>
            ))}
          </div>
          <Button className="mt-4" onClick={() => handleSave('thresholds', config.thresholds)} loading={saving}>Save</Button>
        </Card>
      )}

      {activeTab === 'rateLimits' && (
        <Card>
          <h3 className="font-semibold mb-4">Rate Limits (per minute)</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config.rateLimits || {}).map(([k, v]) => (
              <div key={k}><label className="text-sm text-[var(--text-secondary)]">{k.replace(/([A-Z])/g, ' $1')}</label><input type="number" value={v} onChange={(e) => setConfig(p => ({ ...p, rateLimits: { ...p.rateLimits, [k]: parseInt(e.target.value) } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" /></div>
            ))}
          </div>
          <Button className="mt-4" onClick={() => handleSave('rateLimits', config.rateLimits)} loading={saving}>Save</Button>
        </Card>
      )}

      {activeTab === 'autoModeration' && (
        <Card>
          <h3 className="font-semibold mb-4">Auto-Moderation</h3>
          <div className="space-y-3">
            {Object.entries(config.autoModeration || {}).map(([k, v]) => (
              <Toggle key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} checked={v} onChange={(val) => setConfig(p => ({ ...p, autoModeration: { ...p.autoModeration, [k]: val } }))} />
            ))}
          </div>
          <Button className="mt-4" onClick={() => handleSave('autoModeration', config.autoModeration)} loading={saving}>Save</Button>
        </Card>
      )}

      {activeTab === 'languages' && (
        <Card>
          <h3 className="font-semibold mb-4">Languages</h3>
          <div className="space-y-3">
            <div><label className="text-sm text-[var(--text-secondary)]">Default</label><input value={config.languages?.default || 'en'} onChange={(e) => setConfig(p => ({ ...p, languages: { ...p.languages, default: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" /></div>
            <Toggle label="Auto Detect" checked={config.languages?.autoDetect || false} onChange={(v) => setConfig(p => ({ ...p, languages: { ...p.languages, autoDetect: v } }))} />
            <Toggle label="Translation" checked={config.languages?.translationEnabled || false} onChange={(v) => setConfig(p => ({ ...p, languages: { ...p.languages, translationEnabled: v } }))} />
          </div>
          <Button className="mt-4" onClick={() => handleSave('languages', config.languages)} loading={saving}>Save</Button>
        </Card>
      )}

      {activeTab === 'logging' && (
        <Card>
          <h3 className="font-semibold mb-4">Logging</h3>
          <div className="space-y-3">
            {Object.entries(config.logging || {}).map(([k, v]) => (
              typeof v === 'boolean' ? <Toggle key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} checked={v} onChange={(val) => setConfig(p => ({ ...p, logging: { ...p.logging, [k]: val } }))} />
              : <div key={k}><label className="text-sm text-[var(--text-secondary)]">{k}</label><input type="number" value={v} onChange={(e) => setConfig(p => ({ ...p, logging: { ...p.logging, [k]: parseInt(e.target.value) } }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" /></div>
            ))}
          </div>
          <Button className="mt-4" onClick={() => handleSave('logging', config.logging)} loading={saving}>Save</Button>
        </Card>
      )}

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset AI Config" message="Reset all AI settings to defaults?" confirmLabel="Reset" variant="danger" onConfirm={handleReset} />
    </div>
  );
}