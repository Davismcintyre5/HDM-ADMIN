import { useEffect, useState } from 'react';
import { getCommunication, updateCommunication } from '../../services/smartpos/communication';
import Card from '../../components/smartpos/ui/Card';
import Input from '../../components/smartpos/ui/Input';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';

export default function Communication() {
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCommunication()
      .then(res => setTemplates(res.templates))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateEmail = (key, value) => setTemplates(prev => ({ ...prev, emailTemplates: { ...prev.emailTemplates, [key]: value } }));
  const updateSms = (key, value) => setTemplates(prev => ({ ...prev, smsTemplates: { ...prev.smsTemplates, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try { await updateCommunication(templates); alert('Templates saved'); } catch (err) { alert(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <Card className="text-center text-red-500">{error}</Card>;
  if (!templates) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Communication Templates</h1>
      <div className="space-y-6 max-w-3xl">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Email Templates</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Trial License</label>
              <textarea value={templates.emailTemplates?.trialLicense || ''} onChange={(e) => updateEmail('trialLicense', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Approved</label>
              <textarea value={templates.emailTemplates?.paymentApproved || ''} onChange={(e) => updateEmail('paymentApproved', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Rejected</label>
              <textarea value={templates.emailTemplates?.paymentRejected || ''} onChange={(e) => updateEmail('paymentRejected', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">SMS Templates</h2>
          <Input label="Trial License SMS" value={templates.smsTemplates?.trialLicense || ''} onChange={(e) => updateSms('trialLicense', e.target.value)} />
        </Card>
        <Button onClick={handleSave} loading={saving}>Save Templates</Button>
      </div>
    </div>
  );
}