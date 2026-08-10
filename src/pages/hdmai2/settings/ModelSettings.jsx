import { useState, useEffect } from 'react';
import { getModels } from '../../../services/hdmai2/models';
import Card from '../../../components/hdmai2/ui/Card';
import Input from '../../../components/hdmai2/ui/Input';
import Toggle from '../../../components/hdmai2/ui/Toggle';
import Button from '../../../components/hdmai2/ui/Button';
import Badge from '../../../components/hdmai2/ui/Badge';
import { HiTrash } from 'react-icons/hi';

const FIELDS = [
  { key: 'allowModelSwitching', label: 'Allow Switching', type: 'toggle', defaultValue: true },
  { key: 'searchEnabled', label: 'Web Search', type: 'toggle', defaultValue: true },
  { key: 'deepThinkEnabled', label: 'Deep Think Mode', type: 'toggle', defaultValue: true },
  { key: 'fileUploadEnabled', label: 'File Upload in Chat', type: 'toggle', defaultValue: true },
  { key: 'maxTokens', label: 'Max Tokens', type: 'number', defaultValue: 2048 },
  { key: 'temperature', label: 'Temperature', type: 'number', defaultValue: 0.7 },
  { key: 'responseTimeout', label: 'Response Timeout (s)', type: 'number', defaultValue: 30 },
];

export default function ModelSettings({ settings, onSave, onDelete, saving }) {
  const [models, setModels] = useState([]);
  const [localValues, setLocalValues] = useState({});

  useEffect(() => {
    getModels().then(res => {
      const list = res?.data?.models || res?.data || [];
      setModels(Array.isArray(list) ? list : []);
    }).catch(console.error);
  }, []);

  const getVal = (key, def) => {
    if (key in localValues) return localValues[key];
    return settings.find(s => s.key === key)?.value ?? def;
  };

  const handleChange = (key, value) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key, label) => {
    const val = getVal(key, FIELDS.find(f => f.key === key)?.defaultValue);
    onSave(key, val, 'model', label);
  };

  const handleToggleModel = async (modelName, isActive) => {
    onSave('activeModel', isActive ? modelName : '', 'model', 'Active Model');
  };

  const activeModel = settings.find(s => s.key === 'activeModel')?.value || '';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Model Selection Cards */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Active Models</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Toggle models on/off to set them as active. Only one model can be active at a time.</p>
        <div className="space-y-3">
          {models.map(model => {
            const isActive = activeModel === model.name;
            return (
              <div key={model._id || model.name} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{model.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--text-primary)]">{model.name}</h3>
                      <Badge variant="info">{model.version}</Badge>
                      <Badge variant={model.status === 'active' ? 'success' : 'default'}>{model.status}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Capabilities: {model.capabilities?.length ? model.capabilities.join(', ') : 'None yet'}
                      {model.fileSizeFormatted && ` · ${model.fileSizeFormatted}`}
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={isActive}
                  onChange={v => handleToggleModel(model.name, v)}
                  label={isActive ? 'Active' : 'Inactive'}
                />
              </div>
            );
          })}
          {models.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No models available.</p>
          )}
        </div>
      </Card>

      {/* Other Settings */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Model Settings</h2>
        <div className="space-y-4">
          {FIELDS.map(f => {
            const val = getVal(f.key, f.defaultValue);
            const exists = settings.find(s => s.key === f.key);
            return (
              <div key={f.key} className="flex items-end gap-2">
                <div className="flex-1">
                  {f.type === 'toggle' ? (
                    <Toggle
                      label={f.label}
                      checked={val === true || val === 'true'}
                      onChange={v => onSave(f.key, v, 'model', f.label)}
                      description={
                        f.key === 'searchEnabled' ? 'Enable web search feature' :
                        f.key === 'deepThinkEnabled' ? 'Enable Deep Think mode' :
                        f.key === 'fileUploadEnabled' ? 'Enable file upload in chat' : undefined
                      }
                    />
                  ) : (
                    <Input label={f.label} type={f.type} value={val}
                      onChange={e => handleChange(f.key, e.target.value)}
                      onBlur={() => handleSave(f.key, f.label)} />
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