import { useState } from 'react';
import Card from '../../../components/hdmai2/ui/Card';
import Input from '../../../components/hdmai2/ui/Input';
import Toggle from '../../../components/hdmai2/ui/Toggle';
import Button from '../../../components/hdmai2/ui/Button';
import { HiTrash } from 'react-icons/hi';

const FIELDS = [
  { key: 'appName', label: 'App Name', type: 'text', defaultValue: 'HDM AI' },
  { key: 'tagline', label: 'Tagline', type: 'text', defaultValue: 'AI-Powered Intelligence' },
  { key: 'companyName', label: 'Company Name', type: 'text', defaultValue: 'HDM AI' },
  { key: 'companyUrl', label: 'Company URL', type: 'url', defaultValue: 'https://hdm.ai' },
  { key: 'supportEmail', label: 'Support Email', type: 'email', defaultValue: 'support@hdm.ai' },
  { key: 'supportPhone', label: 'Support Phone', type: 'text', defaultValue: '+254 700 000 000' },
  { key: 'supportWhatsApp', label: 'WhatsApp Number', type: 'text', defaultValue: '+254 712 345 678' },
  { key: 'contactAddress', label: 'Contact Address', type: 'text', defaultValue: 'Nairobi, Kenya' },
  { key: 'timezone', label: 'Timezone', type: 'select', options: ['Africa/Nairobi', 'Africa/Lagos', 'UTC'], defaultValue: 'Africa/Nairobi' },
  { key: 'language', label: 'Default Language', type: 'select', options: ['en', 'sw'], defaultValue: 'en' },
  { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle', defaultValue: false },
];

export default function GeneralSettings({ settings, onSave, onDelete, saving }) {
  const [localValues, setLocalValues] = useState({});

  const getVal = (key, def) => {
    if (key in localValues) return localValues[key];
    return settings.find(s => s.key === key)?.value ?? def;
  };

  const handleChange = (key, value) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key, label) => {
    const val = getVal(key, FIELDS.find(f => f.key === key)?.defaultValue);
    onSave(key, val, 'general', label);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">General Settings</h2>
        <div className="space-y-4">
          {FIELDS.map(f => {
            const val = getVal(f.key, f.defaultValue);
            const exists = settings.find(s => s.key === f.key);
            return (
              <div key={f.key} className="flex items-end gap-2">
                <div className="flex-1">
                  {f.type === 'toggle' ? (
                    <Toggle label={f.label} checked={val === true || val === 'true'} onChange={v => handleSave(f.key, f.label)} />
                  ) : f.type === 'select' ? (
                    <>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{f.label}</label>
                      <select value={val} onChange={e => { handleChange(f.key, e.target.value); }}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <button onClick={() => handleSave(f.key, f.label)}
                        className="mt-1 text-xs text-blue-600 hover:underline">Save</button>
                    </>
                  ) : (
                    <>
                      <Input label={f.label} type={f.type} value={val}
                        onChange={e => handleChange(f.key, e.target.value)}
                        onBlur={() => handleSave(f.key, f.label)} />
                    </>
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