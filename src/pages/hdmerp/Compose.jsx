import { useEffect, useState } from 'react';
import { getRecipients, sendEmail } from '../../services/hdmerp/email';
import Card from '../../components/hdmerp/ui/Card';
import Input from '../../components/hdmerp/ui/Input';
import Button from '../../components/hdmerp/ui/Button';
import Toggle from '../../components/hdmerp/ui/Toggle';
import Spinner from '../../components/hdmerp/ui/Spinner';

export default function Compose() {
  const [recipients, setRecipients] = useState({ tenants: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendMode, setSendMode] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [testFirst, setTestFirst] = useState(false);

  useEffect(() => {
    getRecipients()
      .then(res => setRecipients(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!subject.trim()) return alert('Please enter a subject');
    if (!message.trim()) return alert('Please enter a message');

    setSending(true);
    try {
      const data = { subject: subject.trim(), message };

      if (sendMode === 'all') {
        data.to = 'all';
      } else if (sendMode === 'tenant') {
        if (!selectedTenant) return alert('Please select a tenant');
        data.to = 'tenant';
        data.tenantId = selectedTenant;
      } else if (sendMode === 'user') {
        if (!selectedUser) return alert('Please select a user');
        data.to = 'user';
        data.userId = selectedUser;
      } else if (sendMode === 'custom') {
        const emails = customEmails.split(',').map(e => {
          const trimmed = e.trim();
          return { email: trimmed, name: trimmed.split('@')[0] };
        }).filter(e => e.email);
        if (emails.length === 0) return alert('Please enter at least one email');
        data.to = 'custom';
        data.emails = emails;
      }

      if (testFirst) {
        data.testOnly = true;
      }

      await sendEmail(data);
      alert(testFirst ? 'Test email sent to yourself!' : 'Email sent successfully!');
      if (!testFirst) {
        setSubject('');
        setMessage('');
      }
    } catch (err) { alert(err.message); }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">📧 Compose Email</h1>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recipients</h3>

          {/* Send Mode */}
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="sendMode" value="all" checked={sendMode === 'all'} onChange={() => setSendMode('all')} className="text-green-600" />
              <span className="text-sm">All Tenants</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="sendMode" value="tenant" checked={sendMode === 'tenant'} onChange={() => setSendMode('tenant')} className="text-green-600" />
              <span className="text-sm">Specific Tenant</span>
            </label>
            {sendMode === 'tenant' && (
              <div className="ml-8">
                <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  <option value="">Select Tenant</option>
                  {(recipients.tenants || []).map(t => (
                    <option key={t._id || t.id} value={t._id || t.id}>{t.companyName || t.name} ({t.contactEmail || t.email})</option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="sendMode" value="user" checked={sendMode === 'user'} onChange={() => setSendMode('user')} className="text-green-600" />
              <span className="text-sm">Specific User</span>
            </label>
            {sendMode === 'user' && (
              <div className="ml-8">
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  <option value="">Select User</option>
                  {(recipients.users || []).map(u => (
                    <option key={u._id || u.id} value={u._id || u.id}>{u.name || u.email} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="sendMode" value="custom" checked={sendMode === 'custom'} onChange={() => setSendMode('custom')} className="text-green-600" />
              <span className="text-sm">Custom Emails</span>
            </label>
            {sendMode === 'custom' && (
              <div className="ml-8">
                <Input
                  label="Emails (comma separated)"
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  placeholder="user1@test.com, user2@test.com"
                />
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Message</h3>
          <div className="space-y-4">
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message (HTML)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y font-mono text-sm"
                placeholder="<h2>Hello</h2><p>Your message here...</p>"
              />
            </div>

            <Toggle
              label="Send test to myself first"
              checked={testFirst}
              onChange={setTestFirst}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSend} loading={sending} size="lg">
            📧 {testFirst ? 'Send Test' : 'Send Email'}
          </Button>
        </div>
      </div>
    </div>
  );
}