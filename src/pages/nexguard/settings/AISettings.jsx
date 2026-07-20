import Card from '../../../components/nexguard/ui/Card';
import Input from '../../../components/nexguard/ui/Input';
import Toggle from '../../../components/nexguard/ui/Toggle';
import Button from '../../../components/nexguard/ui/Button';

export default function AISettings({ settings, setSettings, onSave, saving }) {
  const ai = settings.ai || {};
  const toggles = ai.toggles || {};

  const setAi = (key, value) => {
    setSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, [key]: value },
    }));
  };

  const setAiToggle = (key, value) => {
    setSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, toggles: { ...prev.ai?.toggles, [key]: value } },
    }));
  };

  const handleSave = () => {
    onSave({ ai: settings.ai });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Server</h2>
        <div className="space-y-4">
          <Input
            label="Base URL"
            value={ai.baseUrl || ''}
            onChange={e => setAi('baseUrl', e.target.value)}
            placeholder="https://hdmaiserver.pxxl.click"
          />
          <Input
            label="API Key"
            type="password"
            value={ai.apiKey || ''}
            onChange={e => setAi('apiKey', e.target.value)}
            placeholder="hdm_vau_xxxx"
          />
          <Input
            label="Model"
            value={ai.model || ''}
            onChange={e => setAi('model', e.target.value)}
            placeholder="vault"
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Configuration</h2>
        <div className="space-y-4">
          <Toggle
            label="Master Toggle"
            checked={ai.masterToggle || false}
            onChange={v => setAi('masterToggle', v)}
            description="Enable/disable all AI features"
          />
          <Input
            label="AI Name"
            value={ai.name || ''}
            onChange={e => setAi('name', e.target.value)}
          />
          <Input
            label="Default Greeting"
            value={ai.defaultGreeting || ''}
            onChange={e => setAi('defaultGreeting', e.target.value)}
          />
          <Input
            label="Rate Limit (per minute)"
            type="number"
            value={ai.rateLimitPerMinute ?? ''}
            onChange={e => setAi('rateLimitPerMinute', e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={ai.color || '#00c48c'}
                onChange={e => setAi('color', e.target.value)}
                className="w-10 h-10 rounded border border-[var(--border-color)] cursor-pointer"
              />
              <Input
                value={ai.color || ''}
                onChange={e => setAi('color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Toggles</h2>
        <div className="space-y-4">
          <Toggle
            label="Landing Page"
            checked={toggles.landingPage || false}
            onChange={v => setAiToggle('landingPage', v)}
            description="AI chat on public landing page"
          />
          <Toggle
            label="Client Dashboard"
            checked={toggles.clientDashboard || false}
            onChange={v => setAiToggle('clientDashboard', v)}
            description="AI assistant in client dashboard"
          />
          <Toggle
            label="File Upload Analysis"
            checked={toggles.fileUploadAnalysis || false}
            onChange={v => setAiToggle('fileUploadAnalysis', v)}
            description="AI analysis on file uploads"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save AI Settings</Button>
      </div>
    </div>
  );
}