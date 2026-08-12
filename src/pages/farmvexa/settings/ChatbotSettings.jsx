import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

export default function ChatbotSettings({ settings, setSettings, onSave, saving }) {
  const chatbot = settings.system?.chatbot || {};

  const update = (key, value) => setSettings(prev => ({
    ...prev, system: { ...prev.system, chatbot: { ...prev.system?.chatbot, [key]: value } }
  }));

  const handleSave = () => onSave({ system: { ...settings.system, chatbot: settings.system?.chatbot } });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Chatbot Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={chatbot.enabled || false} onChange={v => update('enabled', v)} description="Show AI chatbot on farmer dashboard" />
          {chatbot.enabled && (
            <>
              <Input label="Bot Name" value={chatbot.name || ''} onChange={e => update('name', e.target.value)} placeholder="FarmVexa AI" />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Greeting Message</label>
                <textarea value={chatbot.greeting || ''} onChange={e => update('greeting', e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y"
                  placeholder="Hello! How can I help you with your farm today?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Position</label>
                  <select value={chatbot.position || 'bottom-right'} onChange={e => update('position', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                    {['bottom-right', 'bottom-left'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={chatbot.primaryColor || '#2d6a4f'} onChange={e => update('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer" />
                    <Input value={chatbot.primaryColor || ''} onChange={e => update('primaryColor', e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {chatbot.enabled && (
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Provider</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
              <select value={chatbot.aiProvider || 'gemini'} onChange={e => update('aiProvider', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                {['gemini', 'hdmai'].map(p => <option key={p} value={p}>{p === 'gemini' ? 'Gemini' : 'HDM AI'}</option>)}
              </select>
            </div>

            {(chatbot.aiProvider === 'gemini' || !chatbot.aiProvider) ? (
              <Input label="Gemini API Key" type="password" value={chatbot.geminiApiKey || ''} onChange={e => update('geminiApiKey', e.target.value)} placeholder="AIza..." />
            ) : (
              <>
                <Input label="HDM AI API Key" type="password" value={chatbot.hdmApiKey || ''} onChange={e => update('hdmApiKey', e.target.value)} placeholder="hdm_gen_..." />
                <Input label="Base URL" value={chatbot.hdmBaseUrl || ''} onChange={e => update('hdmBaseUrl', e.target.value)} placeholder="https://hdmaiserver.pxxl.click/api/v1" />
              </>
            )}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Chatbot</Button>
      </div>
    </div>
  );
}