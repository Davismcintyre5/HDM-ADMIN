import { useState, useEffect } from 'react';
import { sendToAll, sendToUser, sendToModule, sendCustom, getTenantUsers } from '../../services/bizhub/communication';
import Card from '../../components/bizhub/ui/Card';
import Input from '../../components/bizhub/ui/Input';
import Button from '../../components/bizhub/ui/Button';
import Badge from '../../components/bizhub/ui/Badge';

export default function Communication() {
  const [target, setTarget] = useState('all');
  const [tenantId, setTenantId] = useState('');
  const [userId, setUserId] = useState('');
  const [module, setModule] = useState('');
  const [users, setUsers] = useState([]);
  const [customForm, setCustomForm] = useState({ to: '', cc: '', bcc: '', subject: '', html: '', channel: 'email' });
  const [simpleForm, setSimpleForm] = useState({ subject: '', message: '', channel: 'email' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (tenantId && (target === 'user')) {
      getTenantUsers(tenantId)
        .then(res => setUsers(res?.data || res || []))
        .catch(() => setUsers([]));
    }
  }, [tenantId, target]);

  const handleSend = async () => {
    if (!simpleForm.subject.trim() || !simpleForm.message.trim()) return alert('Subject and message required');
    setSending(true); setResult(null);
    try {
      let res;
      const data = { subject: simpleForm.subject, message: simpleForm.message, channel: simpleForm.channel };
      if (target === 'all') res = await sendToAll(data);
      else if (target === 'user') res = await sendToUser({ ...data, tenantId, userId });
      else if (target === 'module') res = await sendToModule({ ...data, module });
      setResult(res?.data || res);
      setSimpleForm({ subject: '', message: '', channel: 'email' });
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSending(false);
  };

  const handleCustomSend = async () => {
    if (!customForm.subject.trim() || !customForm.html.trim()) return alert('Subject and HTML required');
    setSending(true); setResult(null);
    try {
      const res = await sendCustom(customForm);
      setResult(res?.data || res);
      setCustomForm({ to: '', cc: '', bcc: '', subject: '', html: '', channel: 'email' });
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSending(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">📢 Communication</h1>

      {/* Simple Message */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Send Message</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Target</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'user', 'module'].map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${target === t ? 'bg-teal-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>{t === 'all' ? 'All Users' : t === 'user' ? 'Specific User' : 'By Module'}</button>
              ))}
            </div>
          </div>
          {target === 'user' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tenant ID" value={tenantId} onChange={e => setTenantId(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">User</label>
                <select value={userId} onChange={e => setUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
                  <option value="">Select user...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
                </select>
              </div>
            </div>
          )}
          {target === 'module' && (
            <Input label="Module" value={module} onChange={e => setModule(e.target.value)} placeholder="resto, pharma, etc." />
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Channel</label>
            <select value={simpleForm.channel} onChange={e => setSimpleForm({ ...simpleForm, channel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="email">Email</option><option value="sms">SMS</option><option value="both">Both</option>
            </select>
          </div>
          <Input label="Subject" value={simpleForm.subject} onChange={e => setSimpleForm({ ...simpleForm, subject: e.target.value })} />
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message</label>
            <textarea value={simpleForm.message} onChange={e => setSimpleForm({ ...simpleForm, message: e.target.value })} rows={5}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y text-sm" /></div>
          <Button onClick={handleSend} loading={sending}>Send</Button>
        </div>
      </Card>

      {/* Custom HTML */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Custom HTML Email</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="To" value={customForm.to} onChange={e => setCustomForm({ ...customForm, to: e.target.value })} placeholder="user@email.com" />
            <Input label="CC" value={customForm.cc} onChange={e => setCustomForm({ ...customForm, cc: e.target.value })} />
            <Input label="BCC" value={customForm.bcc} onChange={e => setCustomForm({ ...customForm, bcc: e.target.value })} />
          </div>
          <Input label="Subject" value={customForm.subject} onChange={e => setCustomForm({ ...customForm, subject: e.target.value })} />
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">HTML Content</label>
            <textarea value={customForm.html} onChange={e => setCustomForm({ ...customForm, html: e.target.value })} rows={8}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-teal-500 resize-y font-mono text-sm" /></div>
          <Button onClick={handleCustomSend} loading={sending}>Send Custom Email</Button>
        </div>
        {result && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
            ✅ Sent successfully!
          </div>
        )}
      </Card>
    </div>
  );
}