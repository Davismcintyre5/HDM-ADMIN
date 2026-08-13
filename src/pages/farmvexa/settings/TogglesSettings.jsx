import Card from '../../../components/farmvexa/ui/Card';
import Toggle from '../../../components/farmvexa/ui/Toggle';
import Button from '../../../components/farmvexa/ui/Button';

const FARMER_EMAILS = [
  { key: 'farmerRegistrationPending', label: 'Registration Pending' },
  { key: 'farmerApproved', label: 'Account Approved' },
  { key: 'farmerRejected', label: 'Account Rejected' },
  { key: 'farmerWelcome', label: 'Welcome Email' },
  { key: 'farmerEmailVerify', label: 'Email Verification' },
  { key: 'farmerPasswordReset', label: 'Password Reset' },
  { key: 'farmerAlertHigh', label: 'Alert - High' },
  { key: 'farmerAlertMedium', label: 'Alert - Medium' },
  { key: 'farmerDiseaseDetected', label: 'Disease Detected' },
  { key: 'farmerDeviceOffline', label: 'Device Offline' },
  { key: 'farmerDailyReport', label: 'Daily Report' },
  { key: 'farmerWeeklyReport', label: 'Weekly Report' },
  { key: 'farmerNewDeviceLogin', label: 'New Device Login' },
  { key: 'farmerVaccinationDue', label: 'Vaccination Due' },
  { key: 'farmerLivestockAlert', label: 'Livestock Alert' },
  { key: 'farmerLowStock', label: 'Low Stock Alert' },
  { key: 'farmerMaintenanceDue', label: 'Maintenance Due' },
  { key: 'farmerWeatherAlert', label: 'Weather Alert' },
  { key: 'farmerTaskOverdue', label: 'Task Overdue' },
  { key: 'farmerReminderUpcoming', label: 'Reminder - Upcoming' },
{ key: 'farmerReminderFinal', label: 'Reminder - Final' },
{ key: 'marketInquiry', label: 'Market Inquiry' },
];

const ADMIN_EMAILS = [
  { key: 'adminNewFarmer', label: 'New Farmer Registered' },
  { key: 'adminSystemCritical', label: 'System Critical' },
  { key: 'adminGeminiEightyPercent', label: 'AI Usage 80%' },
  { key: 'adminGeminiExceeded', label: 'AI Limit Exceeded' },
  { key: 'adminPythonOffline', label: 'Python AI Offline' },
  { key: 'adminDeviceOffline24h', label: 'Device Offline 24h+' },
  { key: 'adminTrainingComplete', label: 'Training Complete' },
  { key: 'adminNewAdmin', label: 'New Admin Added' },
  { key: 'adminWeeklyReport', label: 'Weekly Report' },
  { key: 'teamMemberAdded', label: 'Team Member Added' },
  { key: 'marketInquiry', label: 'Market Inquiry' },
];

const SMS_TOGGLES = [
  { key: 'farmerApproved', label: 'Account Approved' },
  { key: 'farmerAlertHigh', label: 'Alert - High' },
  { key: 'farmerDiseaseDetected', label: 'Disease Detected' },
  { key: 'farmerDeviceOffline', label: 'Device Offline' },
  { key: 'farmerVaccinationDue', label: 'Vaccination Due' },
  { key: 'farmerLivestockAlert', label: 'Livestock Alert' },
  { key: 'farmerLowStock', label: 'Low Stock Alert' },
  { key: 'farmerWeatherAlert', label: 'Weather Alert' },
  { key: 'adminNewFarmer', label: 'New Farmer (Admin)' },
  { key: 'teamMemberAdded', label: 'Team Member Added' },
];

export default function TogglesSettings({ settings, setSettings, onSave, saving }) {
  const emailToggles = settings.emailToggles || {};
  const smsToggles = settings.smsToggles || {};

  const setET = (key, value) => setSettings(prev => ({ ...prev, emailToggles: { ...prev.emailToggles, [key]: value } }));
  const setST = (key, value) => setSettings(prev => ({ ...prev, smsToggles: { ...prev.smsToggles, [key]: value } }));

  const handleSave = () => onSave({ emailToggles: settings.emailToggles, smsToggles: settings.smsToggles });

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Farmer Email Notifications</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {FARMER_EMAILS.map(item => (
            <div key={item.key} className="pt-4 first:pt-0">
              <Toggle label={item.label} checked={emailToggles[item.key] || false} onChange={v => setET(item.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Admin & Team Email Notifications</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {ADMIN_EMAILS.map(item => (
            <div key={item.key} className="pt-4 first:pt-0">
              <Toggle label={item.label} checked={emailToggles[item.key] || false} onChange={v => setET(item.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Notifications</h2>
        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {SMS_TOGGLES.map(item => (
            <div key={item.key} className="pt-4 first:pt-0">
              <Toggle label={item.label} checked={smsToggles[item.key] || false} onChange={v => setST(item.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save Toggles</Button>
      </div>
    </div>
  );
}