import Card from '../../../components/hdmai2/ui/Card';
import Input from '../../../components/hdmai2/ui/Input';
import Toggle from '../../../components/hdmai2/ui/Toggle';
import Button from '../../../components/hdmai2/ui/Button';
import { HiTrash } from 'react-icons/hi';

const FIELDS = [
  { key: 'emailProvider', label: 'Email Provider', type: 'select', options: ['hdmbridge', 'smtp', 'sendgrid'], defaultValue: 'hdmbridge' },
  { key: 'emailFromName', label: 'From Name', type: 'text', defaultValue: 'HDM AI' },
  { key: 'emailFromAddress', label: 'From Address', type: 'email', defaultValue: 'notifications@hdm.ai' },
  { key: 'emailReplyTo', label: 'Reply-To', type: 'email', defaultValue: 'support@hdm.ai' },
  { key: 'welcomeEmail', label: 'Welcome Email', type: 'toggle', defaultValue: true },
  { key: 'verifyEmail', label: 'Verify Email', type: 'toggle', defaultValue: true },
  { key: 'alertEmail', label: 'Alert Email', type: 'email', defaultValue: 'admin@hdm.ai' },
  { key: 'emailFooter', label: 'Email Footer', type: 'text', defaultValue: '© HDM AI' },
];

export default function EmailSettings({ settings, onSave, onDelete, saving }) {
  const getVal = (key, def) => settings.find(s => s.key === key)?.value ?? def;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Settings</h2>
        <div className="space-y-4">
          {FIELDS.map(f => {
            const val = getVal(f.key, f.defaultValue);
            const exists = settings.find(s => s.key === f.key);
            return (
              <div key={f.key} className="flex items-end gap-2">
                <div className="flex-1">
                  {f.type === 'toggle' ? (
                    <Toggle label={f.label} checked={val === true || val === 'true'} onChange={v => onSave(f.key, v, 'email', f.label)} />
                  ) : f.type === 'select' ? (
                    <>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{f.label}</label>
                      <select value={val} onChange={e => onSave(f.key, e.target.value, 'email', f.label)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </>
                  ) : (
                    <Input label={f.label} type={f.type} value={val} onChange={e => onSave(f.key, e.target.value, 'email', f.label)} />
                  )}
                </div>
                {exists && (
                  <Button size="sm" variant="danger" onClick={() => onDelete(f.key)}><HiTrash className="w-4 h-4" /></Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}