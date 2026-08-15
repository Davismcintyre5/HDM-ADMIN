import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

export default function AlertsSettings({ settings, setSettings, onSave, saving }) {
  const alerts = settings.alerts || {};
  const storage = settings.storage || {};

  const updateAlert = (key, value) => setSettings(prev => ({ ...prev, alerts: { ...prev.alerts, [key]: value } }));
  const updateStorage = (key, value) => setSettings(prev => ({ ...prev, storage: { ...prev.storage, [key]: value } }));

  const handleSave = () => {
    const completeAlerts = {
      soilMoistureLow: alerts.soilMoistureLow ?? 20,
      soilMoistureHigh: alerts.soilMoistureHigh ?? 80,
      temperatureHigh: alerts.temperatureHigh ?? 35,
      temperatureLow: alerts.temperatureLow ?? 5,
      humidityHigh: alerts.humidityHigh ?? 85,
      diseaseRiskHumidity: alerts.diseaseRiskHumidity ?? 75,
      diseaseRiskTemperature: alerts.diseaseRiskTemperature ?? 28,
      alertFrequency: alerts.alertFrequency ?? 30,
    };
    const completeStorage = {
      enabled: storage.enabled ?? true,
      tempWarning: storage.tempWarning ?? 30,
      tempCritical: storage.tempCritical ?? 35,
      humidityWarning: storage.humidityWarning ?? 65,
      humidityCritical: storage.humidityCritical ?? 75,
      co2Warning: storage.co2Warning ?? 800,
      co2Critical: storage.co2Critical ?? 1200,
      pirEnabled: storage.pirEnabled ?? true,
      pirNightOnly: storage.pirNightOnly ?? true,
      pirAlertInterval: storage.pirAlertInterval ?? 2,
      cooldownHours: storage.cooldownHours ?? 6,
    };
    onSave({ alerts: completeAlerts, storage: completeStorage });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Alert Thresholds */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Alert Thresholds</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Soil Moisture Low (%)" type="number" value={alerts.soilMoistureLow || ''} onChange={e => updateAlert('soilMoistureLow', +e.target.value)} />
          <Input label="Soil Moisture High (%)" type="number" value={alerts.soilMoistureHigh || ''} onChange={e => updateAlert('soilMoistureHigh', +e.target.value)} />
          <Input label="Temperature Low (°C)" type="number" value={alerts.temperatureLow || ''} onChange={e => updateAlert('temperatureLow', +e.target.value)} />
          <Input label="Temperature High (°C)" type="number" value={alerts.temperatureHigh || ''} onChange={e => updateAlert('temperatureHigh', +e.target.value)} />
          <Input label="Humidity High (%)" type="number" value={alerts.humidityHigh || ''} onChange={e => updateAlert('humidityHigh', +e.target.value)} />
        </div>
      </Card>

      {/* Disease Risk */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Disease Risk</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Temperature (°C)" type="number" value={alerts.diseaseRiskTemperature || ''} onChange={e => updateAlert('diseaseRiskTemperature', +e.target.value)} />
          <Input label="Humidity (%)" type="number" value={alerts.diseaseRiskHumidity || ''} onChange={e => updateAlert('diseaseRiskHumidity', +e.target.value)} />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">Disease risk triggers when temperature &gt; threshold AND humidity &gt; threshold</p>
      </Card>

      {/* Alert Frequency */}
      <Card>
        <Input label="Alert Frequency (minutes)" type="number" value={alerts.alertFrequency || ''} onChange={e => updateAlert('alertFrequency', +e.target.value)} />
      </Card>

      {/* Storage Temperature */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Storage Temperature (°C)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Warning Threshold" type="number" value={storage.tempWarning || ''} onChange={e => updateStorage('tempWarning', +e.target.value)} />
          <Input label="Critical Threshold" type="number" value={storage.tempCritical || ''} onChange={e => updateStorage('tempCritical', +e.target.value)} />
        </div>
      </Card>

      {/* Storage Humidity */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Storage Humidity (%)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Warning Threshold" type="number" value={storage.humidityWarning || ''} onChange={e => updateStorage('humidityWarning', +e.target.value)} />
          <Input label="Critical Threshold" type="number" value={storage.humidityCritical || ''} onChange={e => updateStorage('humidityCritical', +e.target.value)} />
        </div>
      </Card>

      {/* Storage CO2 */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Storage CO2 / Insect Detection (ppm)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Warning Threshold" type="number" value={storage.co2Warning || ''} onChange={e => updateStorage('co2Warning', +e.target.value)} />
          <Input label="Critical Threshold" type="number" value={storage.co2Critical || ''} onChange={e => updateStorage('co2Critical', +e.target.value)} />
        </div>
      </Card>

      {/* Storage PIR */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Storage PIR (Rat Detection)</h2>
        <div className="space-y-4">
          <Toggle label="PIR Enabled" checked={storage.pirEnabled || false} onChange={v => updateStorage('pirEnabled', v)} />
          <Toggle label="Night Only" checked={storage.pirNightOnly || false} onChange={v => updateStorage('pirNightOnly', v)} />
          <Input label="Alert Interval (hours)" type="number" value={storage.pirAlertInterval || ''} onChange={e => updateStorage('pirAlertInterval', +e.target.value)} />
        </div>
      </Card>

      {/* Storage Cooldown */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Cooldown</h2>
        <Input label="Cooldown Hours" type="number" value={storage.cooldownHours || ''} onChange={e => updateStorage('cooldownHours', +e.target.value)} />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Alerts</Button>
      </div>
    </div>
  );
}