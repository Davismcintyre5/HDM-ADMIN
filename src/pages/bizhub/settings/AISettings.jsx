import { useEffect, useState } from 'react';
import { getAISettings, updateAISettings } from '../../../services/bizhub/ai';
import Card from '../../../components/bizhub/ui/Card';
import Input from '../../../components/bizhub/ui/Input';
import Toggle from '../../../components/bizhub/ui/Toggle';
import Button from '../../../components/bizhub/ui/Button';
import Spinner from '../../../components/bizhub/ui/Spinner';

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const MODELS = ['hdm', 'gemini', 'openai', 'anthropic', 'deepseek'];

export default function AISettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    getAISettings()
      .then(res => setSettings(res?.data || res || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getVal = (key, fallback = '') => (settings && settings[key]) ?? fallback;
  const isTrue = (key) => getVal(key) === true || getVal(key) === 'true';

  const handleSave = async (section) => {
    setSaving(true);
    try {
      await updateAISettings(settings);
      alert(`${section} saved!`);
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="md" /></div>;
  if (!settings) return <p className="text-red-500">Failed to load AI settings</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* API Configuration */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">API Configuration</h2>
        <div className="space-y-4">
          <Input
            label="Base URL"
            value={getVal('baseUrl', 'https://hdmaiserver.pxxl.click/api/v1')}
            onChange={e => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={getVal('apiKey')}
                onChange={e => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 pr-12 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 text-sm"
                placeholder="Enter API key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Model</label>
            <select
              value={getVal('model', 'groq')}
              onChange={e => setSettings(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm"
            >
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">HDM AI server connection settings</span>
          <Button size="sm" onClick={() => handleSave('API Config')} loading={saving}>Save API Config</Button>
        </div>
      </Card>

      {/* AI Toggles */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Toggles</h2>
        <div className="space-y-2">
          <Toggle
            label="Landing Page AI"
            checked={isTrue('landingAiEnabled')}
            onChange={v => setSettings(prev => ({ ...prev, landingAiEnabled: v }))}
            description="Enable AI chatbot on the public landing page"
          />
          <Toggle
            label="Client AI"
            checked={isTrue('clientAiEnabled')}
            onChange={v => setSettings(prev => ({ ...prev, clientAiEnabled: v }))}
            description="Enable AI in client dashboards"
          />
          <Toggle
            label="File Upload"
            checked={isTrue('fileUploadEnabled')}
            onChange={v => setSettings(prev => ({ ...prev, fileUploadEnabled: v }))}
            description="Allow file uploads in AI chat"
          />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Enable/disable AI features</span>
          <Button size="sm" onClick={() => handleSave('Toggles')} loading={saving}>Save Toggles</Button>
        </div>
      </Card>

      {/* Bot Identity */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Bot Identity</h2>
        <div className="space-y-4">
          <Input
            label="AI Name"
            value={getVal('aiName', 'BizHub Assistant')}
            onChange={e => setSettings(prev => ({ ...prev, aiName: e.target.value }))}
          />
          <Input
            label="Default Greeting"
            value={getVal('defaultGreeting', 'Hello! How can I help you today?')}
            onChange={e => setSettings(prev => ({ ...prev, defaultGreeting: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <Input
              label="Accent Color"
              value={getVal('color', '#1a73e8')}
              onChange={e => setSettings(prev => ({ ...prev, color: e.target.value }))}
              className="flex-1"
            />
            <input
              type="color"
              value={getVal('color', '#1a73e8')}
              onChange={e => setSettings(prev => ({ ...prev, color: e.target.value }))}
              className="h-10 w-10 rounded cursor-pointer mt-6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Position</label>
            <select
              value={getVal('position', 'bottom-right')}
              onChange={e => setSettings(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
            >
              {POSITIONS.map(p => <option key={p} value={p}>{p.replace('-', ' ')}</option>)}
            </select>
          </div>

          {/* Preview */}
          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden mt-3">
            <div className="px-4 py-2 font-medium text-sm text-white flex items-center gap-2" style={{ backgroundColor: getVal('color', '#1a73e8') }}>
              🤖 {getVal('aiName', 'BizHub Assistant')}
            </div>
            <div className="p-4 bg-[var(--bg-secondary)]">
              <p className="text-sm text-[var(--text-primary)]">{getVal('defaultGreeting', 'Hello! How can I help you today?')}</p>
              <div className="mt-3 flex gap-2">
                <input disabled placeholder="Type your message..." className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" />
                <button className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: getVal('color', '#1a73e8') }}>Send</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Bot name, greeting, color & position</span>
          <Button size="sm" onClick={() => handleSave('Identity')} loading={saving}>Save Identity</Button>
        </div>
      </Card>

      {/* Rate Limits */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Rate Limits</h2>
        <div className="space-y-4">
          <Toggle
            label="Enable Rate Limiting"
            checked={isTrue('rateLimitEnabled')}
            onChange={v => setSettings(prev => ({ ...prev, rateLimitEnabled: v }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Requests"
              type="number"
              value={getVal('rateLimitMaxRequests', '20')}
              onChange={e => setSettings(prev => ({ ...prev, rateLimitMaxRequests: e.target.value }))}
            />
            <Input
              label="Window (minutes)"
              type="number"
              value={getVal('rateLimitWindowMinutes', '15')}
              onChange={e => setSettings(prev => ({ ...prev, rateLimitWindowMinutes: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Rate limiting configuration</span>
          <Button size="sm" onClick={() => handleSave('Rate Limits')} loading={saving}>Save Limits</Button>
        </div>
      </Card>

      {/* System Prompt */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Landing System Prompt</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">System Prompt</label>
            <textarea
              value={getVal('landingSystemPrompt')}
              onChange={e => setSettings(prev => ({ ...prev, landingSystemPrompt: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y text-sm"
              placeholder="You are BizHub assistant..."
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Custom system prompt for landing AI</span>
          <Button size="sm" onClick={() => handleSave('System Prompt')} loading={saving}>Save Prompt</Button>
        </div>
      </Card>
    </div>
  );
}