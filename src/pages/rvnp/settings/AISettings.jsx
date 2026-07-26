import Card from '../../../components/rvnp/ui/Card';
import Input from '../../../components/rvnp/ui/Input';
import Toggle from '../../../components/rvnp/ui/Toggle';
import Button from '../../../components/rvnp/ui/Button';

export default function AISettings({ settings, setSettings, onSave, saving }) {
  const ai = settings.ai || {};

  const setAi = (key, value) => setSettings(prev => ({ ...prev, ai: { ...prev.ai, [key]: value } }));

  const handleSave = () => onSave({ ai: settings.ai });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Master Toggle */}
      <Card>
        <Toggle
          label="AI Master"
          checked={ai.aiEnabled || false}
          onChange={v => setAi('aiEnabled', v)}
          description="Master toggle for all AI features"
        />
      </Card>

      {/* Feature Toggles */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">AI Features</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          <div className="pt-4 first:pt-0">
            <Toggle
              label="AI Chat"
              checked={ai.chatEnabled || false}
              onChange={v => setAi('chatEnabled', v)}
              description="General chat assistant for students"
            />
          </div>
          <div className="pt-4">
            <Toggle
              label="Content Moderation"
              checked={ai.moderationEnabled || false}
              onChange={v => setAi('moderationEnabled', v)}
              description="Auto-scan posts, stories, comments, listings"
            />
            {ai.moderationEnabled && (
              <div className="mt-3 space-y-4 pl-2 border-l-2 border-emerald-200 dark:border-emerald-800">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Moderation Sensitivity: {ai.moderationSensitivity ?? 0.75}
                  </label>
                  <input type="range" min="0" max="1" step="0.05" value={ai.moderationSensitivity ?? 0.75}
                    onChange={e => setAi('moderationSensitivity', parseFloat(e.target.value))}
                    className="w-full accent-emerald-600" />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Content above this score is flagged for review</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Auto-Remove Threshold: {ai.autoFlagThreshold ?? 0.3}
                  </label>
                  <input type="range" min="0" max="1" step="0.05" value={ai.autoFlagThreshold ?? 0.3}
                    onChange={e => setAi('autoFlagThreshold', parseFloat(e.target.value))}
                    className="w-full accent-emerald-600" />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Content below this is auto-approved · 0.30–0.75 = flagged · above 0.75 = auto-removed</p>
                </div>
              </div>
            )}
          </div>
          <div className="pt-4">
            <Toggle
              label="Document Verification"
              checked={ai.verificationScanEnabled || false}
              onChange={v => setAi('verificationScanEnabled', v)}
              description="AI scans student IDs for HDM Verification"
            />
          </div>
          <div className="pt-4">
            <Toggle
              label="Smart Feed Ranking"
              checked={ai.smartFeedEnabled || false}
              onChange={v => setAi('smartFeedEnabled', v)}
              description="AI ranks posts based on user interests"
            />
          </div>
          <div className="pt-4">
            <Toggle
              label="Suggested Replies"
              checked={ai.suggestedRepliesEnabled || false}
              onChange={v => setAi('suggestedRepliesEnabled', v)}
              description="AI suggests quick replies in chat"
            />
          </div>
          <div className="pt-4">
            <Toggle
              label="Trending Topics"
              checked={ai.trendingEnabled || false}
              onChange={v => setAi('trendingEnabled', v)}
              description="AI detects trending keywords from posts"
            />
          </div>
        </div>
      </Card>

      {/* Model Version */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Model Version</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input label="Version" value={ai.modelVersion || ''} onChange={e => setAi('modelVersion', e.target.value)} placeholder="v2.1" />
          </div>
          <Button onClick={handleSave} loading={saving}>Save</Button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">Current AI model version</p>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save All Changes</Button>
      </div>
    </div>
  );
}