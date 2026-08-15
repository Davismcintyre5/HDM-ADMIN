import Card from '../../../components/farmvexa/ui/Card';
import Input from '../../../components/farmvexa/ui/Input';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

const CROP_TYPES = ['tomato', 'vegetable', 'maize', 'potato', 'bean', 'cassava', 'coffee', 'tea', 'wheat', 'rice', 'other'];

export default function FieldScanSettings({ settings, setSettings, onSave, saving }) {
  const fieldScan = settings.fieldScan || {};
  const farmerLimits = fieldScan.farmerLimits || {};
  const fieldLimits = fieldScan.fieldLimits || {};

  const update = (key, value) => setSettings(prev => ({ ...prev, fieldScan: { ...prev.fieldScan, [key]: value } }));
  const updateFarmerLimit = (key, value) => setSettings(prev => ({ ...prev, fieldScan: { ...prev.fieldScan, farmerLimits: { ...prev.fieldScan?.farmerLimits, [key]: value } } }));
  const updateFieldLimit = (key, value) => setSettings(prev => ({ ...prev, fieldScan: { ...prev.fieldScan, fieldLimits: { ...prev.fieldScan?.fieldLimits, [key]: value } } }));

  const toggleCrop = (crop) => {
    const crops = fieldScan.allowedCropTypes || [];
    const updated = crops.includes(crop) ? crops.filter(c => c !== crop) : [...crops, crop];
    update('allowedCropTypes', updated);
  };

  const handleSave = () => {
    const completeFieldScan = {
      enabled: fieldScan.enabled ?? false,
      maxPhotosPerScan: fieldScan.maxPhotosPerScan ?? 100,
      captureInterval: fieldScan.captureInterval ?? 5,
      preFilterPercentage: fieldScan.preFilterPercentage ?? 60,
      farmerLimits: {
        daily: farmerLimits.daily ?? 10,
        weekly: farmerLimits.weekly ?? 50,
        monthly: farmerLimits.monthly ?? 200,
      },
      fieldLimits: {
        daily: fieldLimits.daily ?? 10,
        weekly: fieldLimits.weekly ?? 50,
        monthly: fieldLimits.monthly ?? 200,
      },
      allowedCropTypes: fieldScan.allowedCropTypes || CROP_TYPES,
      requireGpsAccuracy: fieldScan.requireGpsAccuracy ?? 15,
      preFilterEnabled: fieldScan.preFilterEnabled ?? true,
      maxGeminiCallsPerScan: fieldScan.maxGeminiCallsPerScan ?? 30,
      minPhotoSize: fieldScan.minPhotoSize ?? 50,
      maxPhotoSize: fieldScan.maxPhotoSize ?? 500,
    };
    onSave({ fieldScan: completeFieldScan });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Field Scan Configuration</h2>
        <div className="space-y-4">
          <Toggle label="Enabled" checked={fieldScan.enabled || false} onChange={v => update('enabled', v)} description="Master toggle for field scan feature" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Photos Per Scan" type="number" value={fieldScan.maxPhotosPerScan || ''} onChange={e => update('maxPhotosPerScan', +e.target.value)} />
            <Input label="Capture Interval (seconds)" type="number" value={fieldScan.captureInterval || ''} onChange={e => update('captureInterval', +e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pre-Filter Percentage" type="number" value={fieldScan.preFilterPercentage || ''} onChange={e => update('preFilterPercentage', +e.target.value)} />
            <Input label="GPS Accuracy (meters)" type="number" value={fieldScan.requireGpsAccuracy || ''} onChange={e => update('requireGpsAccuracy', +e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Gemini Calls/Scan" type="number" value={fieldScan.maxGeminiCallsPerScan || ''} onChange={e => update('maxGeminiCallsPerScan', +e.target.value)} />
            <div className="flex items-end pb-1">
              <Toggle label="Pre-Filter (OpenCV)" checked={fieldScan.preFilterEnabled || false} onChange={v => update('preFilterEnabled', v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Photo Size (KB)" type="number" value={fieldScan.minPhotoSize || ''} onChange={e => update('minPhotoSize', +e.target.value)} />
            <Input label="Max Photo Size (KB)" type="number" value={fieldScan.maxPhotoSize || ''} onChange={e => update('maxPhotoSize', +e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Farmer Limits</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Daily" type="number" value={farmerLimits.daily || ''} onChange={e => updateFarmerLimit('daily', +e.target.value)} />
          <Input label="Weekly" type="number" value={farmerLimits.weekly || ''} onChange={e => updateFarmerLimit('weekly', +e.target.value)} />
          <Input label="Monthly" type="number" value={farmerLimits.monthly || ''} onChange={e => updateFarmerLimit('monthly', +e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Field Limits</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Daily" type="number" value={fieldLimits.daily || ''} onChange={e => updateFieldLimit('daily', +e.target.value)} />
          <Input label="Weekly" type="number" value={fieldLimits.weekly || ''} onChange={e => updateFieldLimit('weekly', +e.target.value)} />
          <Input label="Monthly" type="number" value={fieldLimits.monthly || ''} onChange={e => updateFieldLimit('monthly', +e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Allowed Crop Types</h2>
        <div className="flex flex-wrap gap-2">
          {CROP_TYPES.map(crop => (
            <button key={crop} type="button" onClick={() => toggleCrop(crop)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                (fieldScan.allowedCropTypes || []).includes(crop)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:border-emerald-600'
              }`}>
              {crop}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Field Scan</Button>
      </div>
    </div>
  );
}