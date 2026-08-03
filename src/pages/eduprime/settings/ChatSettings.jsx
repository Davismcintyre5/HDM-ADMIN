import Card from '../../../components/eduprime/ui/Card';
import Input from '../../../components/eduprime/ui/Input';
import Toggle from '../../../components/eduprime/ui/Toggle';
import Button from '../../../components/eduprime/ui/Button';

export default function ChatSettings({ settings, setSettings, onSave, saving }) {
  const chat = settings.chat || {};

  const updateChat = (key, value) => {
    setSettings(prev => ({ ...prev, chat: { ...prev.chat, [key]: value } }));
  };

  const handleSave = () => {
    onSave({ chat: settings.chat });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Enable Toggle */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">AI Chat Widget</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Add an AI-powered chat assistant to your landing page</p>
          </div>
          <Toggle
            label=""
            checked={chat.chat_enabled || false}
            onChange={(v) => updateChat('chat_enabled', v)}
          />
        </div>
      </Card>

      {chat.chat_enabled && (
        <>
          {/* API Configuration */}
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">API Configuration</h2>
            <div className="space-y-4">
              <Input
                label="API URL"
                value={chat.chat_api_url || ''}
                onChange={e => updateChat('chat_api_url', e.target.value)}
                placeholder="https://api.openai.com/v1/chat/completions"
              />
              <Input
                label="API Key"
                type="password"
                value={chat.chat_api_key || ''}
                onChange={e => updateChat('chat_api_key', e.target.value)}
                placeholder="sk-..."
              />
              <Input
                label="Model"
                value={chat.chat_model || ''}
                onChange={e => updateChat('chat_model', e.target.value)}
                placeholder="gpt-3.5-turbo"
              />
            </div>
          </Card>

          {/* Appearance */}
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bot Name"
                  value={chat.chat_bot_name || ''}
                  onChange={e => updateChat('chat_bot_name', e.target.value)}
                  placeholder="EduPrime Assistant"
                />
                <Input
                  label="Chat Icon (emoji)"
                  value={chat.chat_icon || ''}
                  onChange={e => updateChat('chat_icon', e.target.value)}
                  placeholder="💬"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Greeting Message</label>
                <textarea
                  value={chat.chat_greeting || ''}
                  onChange={e => updateChat('chat_greeting', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm resize-y"
                  placeholder="👋 Hi! How can I help you with EduPrime today?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={chat.chat_color || '#f0a500'}
                      onChange={e => updateChat('chat_color', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={chat.chat_color || ''}
                      onChange={e => updateChat('chat_color', e.target.value)}
                      placeholder="#f0a500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Position</label>
                  <select
                    value={chat.chat_position || 'bottom-right'}
                    onChange={e => updateChat('chat_position', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Chat Settings</Button>
      </div>
    </div>
  );
}