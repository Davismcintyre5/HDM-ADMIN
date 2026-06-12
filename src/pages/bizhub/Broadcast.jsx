import { useEffect, useState } from 'react';
import { getBroadcasts, sendBroadcast, previewBroadcast } from '../../services/bizhub/broadcast';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Input from '../../components/bizhub/ui/Input';
import Spinner from '../../components/bizhub/ui/Spinner';
import { formatDate } from '../../utils/bizhub/formatDate';
import { HiMail, HiEye, HiPaperAirplane, HiUsers } from 'react-icons/hi';

const SYSTEMS = [
  { value: 'resto', label: '🍽️ RestoManagerKE' },
  { value: 'pharma', label: '💊 PharmaSys' },
  { value: 'electro', label: '📱 ElectroStore' },
  { value: 'apartment', label: '🏢 MyApartment' },
];

export default function Broadcast() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    subject: '',
    message: '',
    targetType: 'all',
    targetSystem: '',
    targetUser: '',
    channel: 'email',
  });

  useEffect(() => {
    getBroadcasts()
      .then(res => setHistory(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setPreview(null);
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const data = {
        targetType: form.targetType,
        targetSystem: form.targetType === 'system' ? form.targetSystem : undefined,
      };
      const res = await previewBroadcast(data);
      setPreview(res.data || res);
    } catch (err) { alert(err.message); }
    setPreviewing(false);
  };

  const handleSend = async () => {
    if (!form.subject.trim()) { alert('Please enter a subject'); return; }
    if (!form.message.trim()) { alert('Please enter a message'); return; }
    if (form.targetType === 'system' && !form.targetSystem) { alert('Please select a system'); return; }
    if (form.targetType === 'individual' && !form.targetUser) { alert('Please enter a user ID'); return; }

    if (!window.confirm(`Send broadcast to ${preview?.count || 'all'} recipients?`)) return;

    setSending(true);
    try {
      await sendBroadcast(form);
      alert('Broadcast sent!');
      setForm(prev => ({ ...prev, subject: '', message: '' }));
      setPreview(null);
      // Refresh history
      const res = await getBroadcasts();
      setHistory(res.data || res || []);
    } catch (err) { alert(err.message); }
    setSending(false);
  };

  const historyColumns = [
    { key: 'subject', label: 'Subject', render: (row) => <span className="font-medium">{row.subject}</span> },
    { key: 'targetType', label: 'Target', render: (row) => (
      <Badge variant="teal">{row.targetType}{row.targetSystem ? ` - ${row.targetSystem}` : ''}</Badge>
    )},
    { key: 'recipientCount', label: 'Sent', render: (row) => (
      <span className="flex items-center gap-1"><HiUsers className="w-3.5 h-3.5" /> {row.recipientCount || 0}</span>
    )},
    { key: 'adminName', label: 'Sent By', render: (row) => <span className="text-sm">{row.adminName || 'Admin'}</span> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'DD/MM/YYYY HH:mm') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">📢 Broadcast Messaging</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Compose Broadcast</h3>

          <div className="space-y-4">
            {/* Target Type */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleChange('targetType', 'all')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${form.targetType === 'all' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-[var(--border-color)]'}`}
              >
                <HiUsers className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                <span className="text-sm font-medium">All Users</span>
              </button>
              <button
                onClick={() => handleChange('targetType', 'system')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${form.targetType === 'system' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-[var(--border-color)]'}`}
              >
                <span className="text-2xl block mb-1">📦</span>
                <span className="text-sm font-medium">By System</span>
              </button>
              <button
                onClick={() => handleChange('targetType', 'individual')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${form.targetType === 'individual' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-[var(--border-color)]'}`}
              >
                <span className="text-2xl block mb-1">👤</span>
                <span className="text-sm font-medium">Individual</span>
              </button>
            </div>

            {/* System Selector */}
            {form.targetType === 'system' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select System</label>
                <select value={form.targetSystem} onChange={(e) => handleChange('targetSystem', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  <option value="">Choose system...</option>
                  {SYSTEMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}

            {/* Individual User */}
            {form.targetType === 'individual' && (
              <Input label="User ID" value={form.targetUser} onChange={(e) => handleChange('targetUser', e.target.value)} placeholder="Enter MongoDB User ID" />
            )}

            <Input label="Subject" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)} placeholder="Email subject line..." />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message (HTML)</label>
              <textarea value={form.message} onChange={(e) => handleChange('message', e.target.value)} rows={6}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y font-mono text-sm"
                placeholder="Hello {name},&#10;&#10;We have an update for {business}.&#10;&#10;Thank you." />
              <div className="flex gap-3 mt-2 text-xs text-[var(--text-muted)]">
                <span>Variables:</span>
                <button onClick={() => handleChange('message', form.message + '{name}')} className="text-teal-600 hover:underline">{'{name}'}</button>
                <button onClick={() => handleChange('message', form.message + '{email}')} className="text-teal-600 hover:underline">{'{email}'}</button>
                <button onClick={() => handleChange('message', form.message + '{business}')} className="text-teal-600 hover:underline">{'{business}'}</button>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2 mb-2">
                  <HiEye className="w-5 h-5 text-teal-600" />
                  <span className="font-medium text-teal-700 dark:text-teal-400">{preview.count} recipients</span>
                </div>
                {preview.sample?.length > 0 && (
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    {preview.sample.slice(0, 3).map((s, i) => (
                      <p key={i}>{s.name} ({s.email})</p>
                    ))}
                    {preview.count > 3 && <p>...and {preview.count - 3} more</p>}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview} loading={previewing}>
                <HiEye className="w-4 h-4 mr-1" /> Preview Recipients
              </Button>
              <Button onClick={handleSend} loading={sending} size="lg">
                <HiPaperAirplane className="w-4 h-4 mr-1" /> Send Broadcast
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Broadcast History</h3>
        <Table columns={historyColumns} data={history} loading={loading} emptyMessage="No broadcasts sent yet." />
      </Card>
    </div>
  );
}