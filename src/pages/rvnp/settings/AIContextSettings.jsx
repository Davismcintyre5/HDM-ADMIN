import { useState, useEffect } from 'react';
import { getAIContext, updateAIContext } from '../../../services/rvnp/settings';
import Button from '../../../components/rvnp/ui/Button';
import Spinner from '../../../components/rvnp/ui/Spinner';
import { HiBookOpen, HiOfficeBuilding, HiClipboardList, HiCurrencyDollar, HiPhone, HiPlus } from 'react-icons/hi';

const FIELDS = [
  { key: 'courses', label: 'Courses Offered', icon: HiBookOpen, placeholder: 'e.g., Diploma in ICT, Certificate in Electrical Engineering, Diploma in Business...' },
  { key: 'campuses', label: 'Campuses', icon: HiOfficeBuilding, placeholder: 'e.g., Main Campus (Njoro Road), Nakuru City Campus, Kericho Campus, Mwachon Campus, Kureisoi Campus...' },
  { key: 'admissions', label: 'Admissions', icon: HiClipboardList, placeholder: 'e.g., Applications open in January and September. Requirements: KCSE C- and above...' },
  { key: 'fees', label: 'Fees', icon: HiCurrencyDollar, placeholder: 'e.g., Diploma programs: KSh 45,000 per year. Certificate programs: KSh 30,000 per year...' },
  { key: 'contact', label: 'Contact Information', icon: HiPhone, placeholder: 'e.g., Phone: +254 700 000 000, Email: info@rvnp.ac.ke, Website: rvnp.ac.ke...' },
  { key: 'additional', label: 'Additional Information', icon: HiPlus, placeholder: 'Any other information HDM AI should know about RVNP...' },
];

export default function AIContextSettings() {
  const [context, setContext] = useState({
    courses: '',
    campuses: '',
    admissions: '',
    fees: '',
    contact: '',
    additional: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    setLoading(true);
    try {
      const res = await getAIContext();
      const data = res?.data || res || {};
      setContext({
        courses: data.courses || '',
        campuses: data.campuses || '',
        admissions: data.admissions || '',
        fees: data.fees || '',
        contact: data.contact || '',
        additional: data.additional || '',
      });
      setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : null);
    } catch {
      setError('Failed to load AI context');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await updateAIContext(context);
      setSuccess('RVNP context saved! HDM AI will use this information.');
      setLastUpdated(new Date().toLocaleString());
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setContext((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>HDM AI Knowledge Base</strong> — Fill in accurate RVNP information below.
          HDM AI will use this to answer questions from students, staff, and guests.
          Be specific and accurate to avoid hallucination.
        </p>
        {lastUpdated && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Fields */}
      {FIELDS.map((field) => (
        <div key={field.key} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <field.icon className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-[var(--text-primary)]">{field.label}</h3>
          </div>

          <textarea
            value={context[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.key === 'additional' ? 5 : 4}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-emerald-600 resize-y text-sm"
          />
        </div>
      ))}

      {/* Save Button */}
      <Button onClick={handleSave} loading={saving} className="w-full">
        Save RVNP Context
      </Button>
    </div>
  );
}