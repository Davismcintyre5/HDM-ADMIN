import { useState } from 'react';
import Card from '../../../components/marketbridge/ui/Card';
import Input from '../../../components/marketbridge/ui/Input';
import Toggle from '../../../components/marketbridge/ui/Toggle';
import Button from '../../../components/marketbridge/ui/Button';
import Badge from '../../../components/marketbridge/ui/Badge';
import { HiCheck, HiX } from 'react-icons/hi';

const STORE_TIERS = ['basic', 'pro', 'enterprise'];

export default function AISettings({ settings, setSettings, onSave, saving: globalSaving }) {
  const getVal = (key, fallback = '') => settings[key] || fallback;
  const isTrue = (key) => getVal(key) === 'true' || getVal(key) === true;
  const [savingSection, setSavingSection] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSaveSection = async (section, keys) => {
    setSavingSection(section);
    for (const key of keys) {
      await onSave(key, settings[key]);
    }
    setSavingSection('');
  };

  const handleTestConnection = async () => {
    setTestResult('testing');
    try {
      const api = (await import('../../../services/marketbridge/api')).default;
      const res = await api.post('/settings/ai/test');
      setTestResult(res?.data?.success ? 'success' : 'failed');
    } catch (e) {
      setTestResult('failed');
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  const toggleTier = (tier) => {
    const current = (getVal('ai_store_tiers') || '').split(',').filter(Boolean);
    const updated = current.includes(tier) ? current.filter(t => t !== tier) : [...current, tier];
    setSettings(prev => ({ ...prev, ai_store_tiers: updated.join(',') }));
  };

  const tierSelected = (tier) => (getVal('ai_store_tiers') || '').split(',').includes(tier);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* API Configuration */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">API Configuration</h2>
        <div className="space-y-4">
          <Input label="Base URL" value={getVal('ai_base_url', 'https://hdmaiserver.pxxl.click/api/v1')} onChange={e => setSettings(prev => ({ ...prev, ai_base_url: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">API Key</label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={getVal('ai_api_key')} onChange={e => setSettings(prev => ({ ...prev, ai_api_key: e.target.value }))}
                className="w-full px-3 py-2 pr-12 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-violet-500 text-sm" />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <Input label="Model" value={getVal('ai_model', 'groq')} onChange={e => setSettings(prev => ({ ...prev, ai_model: e.target.value }))} />
          <Input label="Endpoint" value={getVal('ai_endpoint', '/projects/general/public-chat')} onChange={e => setSettings(prev => ({ ...prev, ai_endpoint: e.target.value }))} />

          {testResult === 'success' && <div className="flex items-center gap-2 text-sm text-green-600"><HiCheck className="w-4 h-4" /> Connected to {getVal('ai_model', 'groq')}</div>}
          {testResult === 'failed' && <div className="flex items-center gap-2 text-sm text-red-600"><HiX className="w-4 h-4" /> Connection failed</div>}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <Button size="sm" variant="outline" onClick={handleTestConnection} loading={testResult === 'testing'}>Test Connection</Button>
          <Button size="sm" onClick={() => handleSaveSection('api', ['ai_base_url', 'ai_api_key', 'ai_model', 'ai_endpoint'])} loading={savingSection === 'api'}>Save API Config</Button>
        </div>
      </Card>

{/* Chatbot Status */}
<Card>
  <h2 className="font-semibold text-[var(--text-primary)] mb-4">Chatbot Status</h2>
  <div className="space-y-2">
    <Toggle 
      label="Enable Chatbot" 
      checked={isTrue('ai_enabled')} 
      onChange={v => {
        const val = v ? 'true' : 'false';
        setSettings(prev => ({ ...prev, ai_enabled: val }));
        onSave('ai_enabled', val);
      }}
      description="Master switch for the AI chatbot on the platform"
    />
    <Toggle 
      label="Enable Store AI" 
      checked={isTrue('ai_store_enabled')} 
      onChange={v => {
        const val = v ? 'true' : 'false';
        setSettings(prev => ({ ...prev, ai_store_enabled: val }));
        onSave('ai_store_enabled', val);
      }}
      description="Allow individual stores to use AI features"
    />
  </div>
</Card>

      {/* Bot Identity */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Bot Identity</h2>
        <div className="space-y-4">
          <Input label="Bot Name" value={getVal('ai_bot_name', 'MarketBridge Assistant')} onChange={e => setSettings(prev => ({ ...prev, ai_bot_name: e.target.value }))} />
          <div className="flex items-center gap-3">
            <Input label="Accent Color" value={getVal('ai_bot_color', '#0A66C2')} onChange={e => setSettings(prev => ({ ...prev, ai_bot_color: e.target.value }))} className="flex-1" />
            <input type="color" value={getVal('ai_bot_color', '#0A66C2')} onChange={e => setSettings(prev => ({ ...prev, ai_bot_color: e.target.value }))} className="h-10 w-10 rounded cursor-pointer" />
          </div>
          <Input label="Default Greeting" value={getVal('ai_default_greeting', 'Hi! 👋 How can I help you today?')} onChange={e => setSettings(prev => ({ ...prev, ai_default_greeting: e.target.value }))} />

          {/* Preview */}
          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="px-4 py-2 font-medium text-sm text-white flex items-center gap-2" style={{ backgroundColor: getVal('ai_bot_color', '#0A66C2') }}>
              🤖 {getVal('ai_bot_name', 'MarketBridge Assistant')}
            </div>
            <div className="p-4 bg-[var(--bg-secondary)]">
              <p className="text-sm text-[var(--text-primary)]">{getVal('ai_default_greeting', 'Hi! 👋 How can I help you today?')}</p>
              <div className="mt-3 flex gap-2">
                <input disabled placeholder="Type your message..." className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm" />
                <button className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: getVal('ai_bot_color', '#0A66C2') }}>Send</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Bot name, color & greeting</span>
          <Button size="sm" onClick={() => handleSaveSection('identity', ['ai_bot_name', 'ai_bot_color', 'ai_default_greeting'])} loading={savingSection === 'identity'}>Save Identity</Button>
        </div>
      </Card>

      {/* Store Access */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Store Access</h2>
        <div className="space-y-3">
          <Toggle label="Allow stores to use AI" checked={isTrue('ai_store_enabled')} onChange={v => {
            const val = v ? 'true' : 'false';
            setSettings(prev => ({ ...prev, ai_store_enabled: val }));
            onSave('ai_store_enabled', val);
          }} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Allowed Tiers</label>
            <div className="flex gap-2">
              {STORE_TIERS.map(tier => (
                <label key={tier} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tierSelected(tier)} onChange={() => toggleTier(tier)} className="w-4 h-4 text-violet-600 rounded" />
                  <span className="text-sm capitalize">{tier}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Store AI access & tier permissions</span>
          <Button size="sm" onClick={() => handleSaveSection('store', ['ai_store_enabled', 'ai_store_tiers'])} loading={savingSection === 'store'}>Save Store Access</Button>
        </div>
      </Card>

      {/* Rate Limits */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Rate Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Messages per user/min" type="number" value={getVal('ai_rate_limit', '10')} onChange={e => setSettings(prev => ({ ...prev, ai_rate_limit: e.target.value }))} />
          <Input label="Max Conversation Length" type="number" value={getVal('ai_max_messages', '50')} onChange={e => setSettings(prev => ({ ...prev, ai_max_messages: e.target.value }))} />
          <Input label="Session Timeout (min)" type="number" value={getVal('ai_session_timeout', '30')} onChange={e => setSettings(prev => ({ ...prev, ai_session_timeout: e.target.value }))} />
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">Rate limiting & session control</span>
          <Button size="sm" onClick={() => handleSaveSection('limits', ['ai_rate_limit', 'ai_max_messages', 'ai_session_timeout'])} loading={savingSection === 'limits'}>Save Limits</Button>
        </div>
      </Card>
    </div>
  );
}