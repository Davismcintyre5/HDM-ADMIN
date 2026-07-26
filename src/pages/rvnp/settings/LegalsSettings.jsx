import Card from '../../../components/rvnp/ui/Card';
import Button from '../../../components/rvnp/ui/Button';

export default function LegalsSettings({ settings, onSave, saving }) {
  const legals = settings.legals || {};

  const handleSave = () => onSave({ legals });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Terms of Service</h2>
        <textarea
          value={legals.terms || ''}
          onChange={e => settings.legals = { ...settings.legals, terms: e.target.value }}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y"
        />
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Privacy Policy</h2>
        <textarea
          value={legals.privacy || ''}
          onChange={e => settings.legals = { ...settings.legals, privacy: e.target.value }}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y"
        />
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Community Guidelines</h2>
        <textarea
          value={legals.guidelines || ''}
          onChange={e => settings.legals = { ...settings.legals, guidelines: e.target.value }}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] resize-y"
        />
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Legals</Button>
      </div>
    </div>
  );
}