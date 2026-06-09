import { useEffect, useState } from 'react';
import { getRecipients, sendEmail, sendTestEmail } from '../../services/smartpos/email';
import Card from '../../components/smartpos/ui/Card';
import Input from '../../components/smartpos/ui/Input';
import Button from '../../components/smartpos/ui/Button';
import Spinner from '../../components/smartpos/ui/Spinner';
import Badge from '../../components/smartpos/ui/Badge';
import Modal from '../../components/smartpos/ui/Modal';
import { HiMail, HiEye, HiX } from 'react-icons/hi';

export default function Compose() {
  const [recipients, setRecipients] = useState({ clients: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    to: 'all-clients',
    clientId: '',
    userId: '',
    role: '',
    subject: '',
    message: '',
    testMode: false,
  });

  useEffect(() => {
    getRecipients()
      .then(res => setRecipients(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const getRecipientCount = () => {
    switch (form.to) {
      case 'all-clients': return recipients.clients?.length || 0;
      case 'all-users': return recipients.users?.length || 0;
      case 'all-admins': return recipients.users?.filter(u => u.role === 'owner' || u.role === 'admin').length || 0;
      case 'specific-client': return form.clientId ? 1 : 0;
      case 'specific-user': return form.userId ? 1 : 0;
      case 'specific-role': return recipients.users?.filter(u => u.role === form.role).length || 0;
      default: return 0;
    }
  };

  const handleSend = async () => {
    if (!form.subject.trim()) { alert('Please enter a subject'); return; }
    if (!form.message.trim()) { alert('Please enter a message'); return; }

    setSending(true);
    try {
      const res = await sendEmail(form);
      setResult(res.data || res);
      alert(res.message || 'Email sent!');
      if (!form.testMode) {
        setForm(prev => ({ ...prev, subject: '', message: '' }));
      }
    } catch (err) { alert(err.message); }
    setSending(false);
  };

  const handleTest = async () => {
    if (!form.subject && !form.message) { alert('Please enter subject and message first'); return; }
    try {
      await sendTestEmail(form.subject, form.message);
      alert('Test email sent to your inbox');
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const count = getRecipientCount();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">📧 Compose Email</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Recipients */}
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recipients</h3>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Send To</label>
            <select value={form.to} onChange={(e) => handleChange('to', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="all-clients">📢 All Clients ({recipients.clients?.length || 0})</option>
              <option value="all-users">👥 All Users ({recipients.users?.length || 0})</option>
              <option value="all-admins">👑 All Admins</option>
              <option value="specific-client">🏢 Specific Client</option>
              <option value="specific-user">👤 Specific User</option>
              <option value="specific-role">💼 Specific Role</option>
            </select>
          </div>

          {form.to === 'specific-client' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Client</label>
              <select value={form.clientId} onChange={(e) => handleChange('clientId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="">Choose a client...</option>
                {recipients.clients?.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
          )}

          {form.to === 'specific-user' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select User</label>
              <select value={form.userId} onChange={(e) => handleChange('userId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="">Choose a user...</option>
                {recipients.users?.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
                ))}
              </select>
            </div>
          )}

          {form.to === 'specific-role' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Role</label>
              <select value={form.role} onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                <option value="">Choose a role...</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          )}

          {count > 0 && (
            <div className="mt-3 text-sm text-blue-600">
              <Badge variant="info">{count} recipient(s)</Badge>
            </div>
          )}
        </Card>

        {/* Subject */}
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Subject</h3>
          <Input value={form.subject} onChange={(e) => handleChange('subject', e.target.value)} placeholder="Enter email subject..." />
        </Card>

        {/* Message */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Message (HTML)</h3>
            <Button size="sm" variant="outline" onClick={() => setPreview(true)}><HiEye className="w-4 h-4 mr-1" /> Preview</Button>
          </div>
          <textarea value={form.message} onChange={(e) => handleChange('message', e.target.value)} rows={12}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
            placeholder="<p>Dear user,</p><p>Your message here...</p>" />
          <p className="text-xs text-[var(--text-muted)] mt-2">Supports HTML tags: &lt;p&gt;, &lt;b&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt;</p>
        </Card>

        {/* Options */}
        <Card>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.testMode} onChange={(e) => handleChange('testMode', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-[var(--text-primary)]">Send test to myself first</span>
          </label>
        </Card>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleTest}>🔧 Send Test</Button>
          <Button onClick={handleSend} loading={sending} size="lg">📧 {sending ? 'Sending...' : 'Send Email'}</Button>
        </div>

        {/* Result */}
        {result && (
          <Card className={result.sent === result.total ? 'border-green-200 bg-green-50/30' : 'border-yellow-200 bg-yellow-50/30'}>
            <div className="flex items-center gap-2">
              <Badge variant={result.sent === result.total ? 'success' : 'warning'}>
                Sent: {result.sent} | Failed: {result.failed} | Total: {result.total}
              </Badge>
            </div>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      <Modal open={preview} onClose={() => setPreview(false)} title="Email Preview" size="lg">
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 border-b">
            <p className="text-sm"><strong>Subject:</strong> {form.subject || 'No subject'}</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: form.message || '<em>No message content</em>' }} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setPreview(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}