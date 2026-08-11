import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Button from '../../../components/farmvexa/ui/Button';

export default function AISettings({ settings, setSettings, onSave, saving }) {
  const ai = settings.ai || {};
  const gemini = settings.gemini || {};

  const update = (section, key, value) => setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const handleSave = () => onSave({ ai: settings.ai, gemini: settings.gemini });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">AI Engine</label>
            <select value={ai.aiUsed || 'gemini'} onChange={e => update('ai', 'aiUsed', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              {['local', 'gemini', 'hdmai'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <Input label="Python AI URL" value={ai.pythonAiUrl || ''} onChange={e => update('ai', 'pythonAiUrl', e.target.value)} placeholder="http://localhost:8000" />
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Confidence Threshold</span>
              <span className="text-[var(--text-primary)] font-bold">{ai.confidenceThreshold ?? 0.75}</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={ai.confidenceThreshold ?? 0.75}
              onChange={e => update('ai', 'confidenceThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer accent-emerald-500" />
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Daily Limits</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Per User" type="number" value={gemini.dailyLimitPerUser || ''} onChange={e => update('gemini', 'dailyLimitPerUser', +e.target.value)} />
          <Input label="System Total" type="number" value={gemini.dailyLimitTotal || ''} onChange={e => update('gemini', 'dailyLimitTotal', +e.target.value)} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save AI Settings</Button>
      </div>
    </div>
  );
}