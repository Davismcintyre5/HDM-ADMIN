import { useEffect, useState } from 'react';
import {
  getSettings,
  updateSettings,
} from '../../services/portfolio/settings';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import Button from '../../components/portfolio/ui/Button';
import Spinner from '../../components/portfolio/ui/Spinner';
import Card from '../../components/portfolio/ui/Card';
import { useToast } from '../../context/portfolio/ToastContext';

const DEFAULT_AI = {
  enabled: false,
  greeting: "Hi! I'm HDM AI. Ask me about our services, apps, or projects.",
  widgetColor: '#1e6ef0',
  widgetPosition: 'right',
};

export default function Settings() {
  const toast = useToast();

  const [settings, setSettings] = useState(DEFAULT_AI);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((res) => {
        const data = res.data || res || {};
        const ai = data.ai || data;
        setSettings({ ...DEFAULT_AI, ...ai });
      })
      .catch((err) => toast.error(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ ai: settings });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">
          AI Chatbot
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Enabled"
            description="Show the AI chat widget on the portfolio site"
            checked={settings.enabled}
            onChange={(v) => updateField('enabled', v)}
          />
          {settings.enabled && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Greeting message
                </label>
                <textarea
                  value={settings.greeting || ''}
                  onChange={(e) => updateField('greeting', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm"
                />
              </div>
              <Input
                label="Widget Color"
                type="color"
                value={settings.widgetColor || '#1e6ef0'}
                onChange={(e) => updateField('widgetColor', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Widget Position
                </label>
                <div className="flex gap-3">
                  {['left', 'right'].map((pos) => (
                    <label
                      key={pos}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        settings.widgetPosition === pos
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="widgetPosition"
                        value={pos}
                        checked={settings.widgetPosition === pos}
                        onChange={(e) =>
                          updateField('widgetPosition', e.target.value)
                        }
                        className="hidden"
                      />
                      <span className="capitalize text-sm font-medium">
                        {pos}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <p className="text-xs text-[var(--text-muted)]">
        Note: AI API key and base URL are configured in the server&apos;s
        environment, not here.
      </p>

      <Button onClick={handleSave} loading={saving}>
        Save Settings
      </Button>
    </div>
  );
}