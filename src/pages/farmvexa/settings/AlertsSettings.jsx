import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Button from '../../../components/farmvexa/ui/Button';

export default function AlertsSettings({ settings, setSettings, onSave, saving }) {
  const alerts = settings.alerts || {};

  const update = (key, value) => setSettings(prev => ({ ...prev, alerts: { ...prev.alerts, [key]: value } }));
  const handleSave = () => onSave({ alerts: settings.alerts });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Alert Thresholds</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Soil Moisture Low (%)" type="number" value={alerts.soilMoistureLow || ''} onChange={e => update('soilMoistureLow', +e.target.value)} />
          <Input label="Soil Moisture High (%)" type="number" value={alerts.soilMoistureHigh || ''} onChange={e => update('soilMoistureHigh', +e.target.value)} />
          <Input label="Temperature Low (°C)" type="number" value={alerts.temperatureLow || ''} onChange={e => update('temperatureLow', +e.target.value)} />
          <Input label="Temperature High (°C)" type="number" value={alerts.temperatureHigh || ''} onChange={e => update('temperatureHigh', +e.target.value)} />
          <Input label="Humidity High (%)" type="number" value={alerts.humidityHigh || ''} onChange={e => update('humidityHigh', +e.target.value)} />
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Disease Risk</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Temperature (°C)" type="number" value={alerts.diseaseRiskTemperature || ''} onChange={e => update('diseaseRiskTemperature', +e.target.value)} />
          <Input label="Humidity (%)" type="number" value={alerts.diseaseRiskHumidity || ''} onChange={e => update('diseaseRiskHumidity', +e.target.value)} />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">Disease risk triggers when temperature &gt; threshold AND humidity &gt; threshold</p>
      </Card>
      <Card>
        <Input label="Alert Frequency (minutes)" type="number" value={alerts.alertFrequency || ''} onChange={e => update('alertFrequency', +e.target.value)} />
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Alerts</Button>
      </div>
    </div>
  );
}