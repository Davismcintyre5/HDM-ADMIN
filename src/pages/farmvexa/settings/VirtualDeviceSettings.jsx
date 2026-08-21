import { useState, useEffect } from 'react';
import { getVirtualDeviceSettings, updateVirtualDeviceSettings, getVirtualDevices } from '../../../services/farmvexa/virtualDevice';
import Card from '../../../components/farmvexa/ui/Card';
import Badge from '../../../components/farmvexa/ui/Badge';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Input from '../../../components/farmvexa/ui/Input';
import Button from '../../../components/farmvexa/ui/Button';
import Spinner from '../../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../../utils/farmvexa/formatDate';

const PLANS = ['Basic', 'Basic Monthly', 'Pro', 'Full Suite'];

const SENSORS = [
  { key: 'temperature', label: '🌡️ Temperature', source: 'Weather API' },
  { key: 'humidity', label: '💧 Humidity', source: 'Weather API' },
  { key: 'soilMoisture', label: '🌱 Soil Moisture', source: 'Rainfall Estimate' },
  { key: 'lightLevel', label: '☀️ Light Level', source: 'Time of Day' },
  { key: 'co2', label: '🦠 CO2 Level', source: 'Baseline (400-600 ppm)' },
  { key: 'motion', label: '🐀 Motion Detection', source: 'Fixed (false)' },
];

export default function VirtualDeviceSettings({ settings, setSettings, onSave, saving }) {
  const [virtualSettings, setVirtualSettings] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);

  useEffect(() => {
    Promise.all([getVirtualDeviceSettings(), getVirtualDevices()])
      .then(([s, d]) => {
        setVirtualSettings(s?.data?.virtualDevice || s?.data || s || {});
        setDevices(d?.data?.devices || d?.data || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setVirtualSettings(prev => ({ ...prev, [key]: value }));

  const handleToggle = async (v) => {
    const updated = { ...virtualSettings, enabled: v };
    setVirtualSettings(updated);
    setSavingToggle(true);
    try {
      await updateVirtualDeviceSettings(updated);
    } catch (err) { alert(err.message); }
    setSavingToggle(false);
  };

  const togglePlan = (plan) => {
    const plans = virtualSettings.showForPlans || {};
    update('showForPlans', { ...plans, [plan]: !plans[plan] });
  };

  const toggleSensor = (key) => {
    const readings = virtualSettings.readings || {};
    const current = readings[key] || { enabled: true, source: '' };
    update('readings', { ...readings, [key]: { ...current, enabled: !(current.enabled ?? true) } });
  };

  const handleSave = async () => {
    try {
      await updateVirtualDeviceSettings(virtualSettings);
      alert('Saved!');
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">📡 Default Virtual Device</h2>
          <Toggle checked={virtualSettings?.enabled || false} onChange={handleToggle} />
        </div>

        {virtualSettings?.enabled ? (
          <>
            <div className="space-y-4 mb-6">
              <Input label="Device Name" value={virtualSettings?.name || ''} onChange={e => update('name', e.target.value)} placeholder="FarmVexa Virtual" />
              <Input label="Reading Interval (minutes)" type="number" value={virtualSettings?.intervalMinutes || ''} onChange={e => update('intervalMinutes', +e.target.value)} />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Available Plans</h3>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map(plan => (
                  <label key={plan} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
                    <input type="checkbox" checked={virtualSettings?.showForPlans?.[plan] || false} onChange={() => togglePlan(plan)}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-emerald-600" />
                    {plan}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Sensor Readings</h3>
              <div className="space-y-2">
                {SENSORS.map(sensor => (
                  <label key={sensor.key} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
                    <input type="checkbox"
                      checked={virtualSettings?.readings?.[sensor.key]?.enabled ?? false}
                      onChange={() => toggleSensor(sensor.key)}
                      className="w-4 h-4 rounded border-[var(--border-color)] text-emerald-600" />
                    {sensor.label}
                    <span className="text-xs text-[var(--text-muted)] ml-1">— {sensor.source}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving || savingToggle} size="lg">💾 Save Settings</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">Virtual device is disabled. Enable to configure.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Current Virtual Devices</h2>
        {devices.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No virtual devices created yet.</p>
        ) : (
          <div className="space-y-2">
            {devices.map((device, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{device.farm?.name || device.farmName || 'Unknown Farm'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{device.name || device.deviceName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={device.status === 'online' ? 'success' : 'danger'}>{device.status}</Badge>
                  <span className="text-xs text-[var(--text-muted)]">Last: {formatDate(device.lastReading || device.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}