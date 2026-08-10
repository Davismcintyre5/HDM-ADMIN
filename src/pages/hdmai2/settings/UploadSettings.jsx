import Card from '../../../components/hdmai2/ui/Card';
import Input from '../../../components/hdmai2/ui/Input';
import Toggle from '../../../components/hdmai2/ui/Toggle';
import Button from '../../../components/hdmai2/ui/Button';
import { HiTrash } from 'react-icons/hi';

const FIELDS = [
  { key: 'storageType', label: 'Storage Type', type: 'select', options: ['local', 'cloudinary'], defaultValue: 'local' },
  { key: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', defaultValue: 500 },
  { key: 'allowedExtensions', label: 'Allowed Types', type: 'text', defaultValue: '.json,.csv,.zip,.hdm' },
  { key: 'maxDatasetsPerUser', label: 'Max Datasets/User', type: 'number', defaultValue: 50 },
  { key: 'autoCleanTemp', label: 'Auto Clean Temp', type: 'toggle', defaultValue: true },
  { key: 'cloudinaryFolder', label: 'Cloudinary Folder', type: 'text', defaultValue: 'hdm-ai-uploads' },
];

export default function UploadSettings({ settings, onSave, onDelete, saving }) {
  const getVal = (key, def) => settings.find(s => s.key === key)?.value ?? def;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Upload Settings</h2>
        <div className="space-y-4">
          {FIELDS.map(f => {
            const val = getVal(f.key, f.defaultValue);
            const exists = settings.find(s => s.key === f.key);
            return (
              <div key={f.key} className="flex items-end gap-2">
                <div className="flex-1">
                  {f.type === 'toggle' ? (
                    <Toggle label={f.label} checked={val === true || val === 'true'} onChange={v => onSave(f.key, v, 'upload', f.label)} />
                  ) : f.type === 'select' ? (
                    <>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{f.label}</label>
                      <select value={val} onChange={e => onSave(f.key, e.target.value, 'upload', f.label)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </>
                  ) : (
                    <Input label={f.label} type={f.type} value={val} onChange={e => onSave(f.key, e.target.value, 'upload', f.label)} />
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