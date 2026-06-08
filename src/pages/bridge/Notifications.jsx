import { useEffect, useState } from 'react';
import { getNotificationStats, sendToAll, sendToUser } from '../../services/bridge/notifications';
import { getUsers } from '../../services/bridge/users';
import Card from '../../components/bridge/ui/Card';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Input from '../../components/bridge/ui/Input';
import Spinner from '../../components/bridge/ui/Spinner';

export default function Notifications() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendMode, setSendMode] = useState('all');
  const [selectedUser, setSelectedUser] = useState('');
  const [fromName, setFromName] = useState('HDM BRIDGE Admin');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    Promise.all([getNotificationStats(), getUsers({ limit: 100 })])
      .then(([s, u]) => {
        setStats(s.stats || s.data || s);
        setUsers(u.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return alert('Subject and message are required');
    setSending(true);
    try {
      const data = { fromName: fromName.trim(), subject: subject.trim(), message };
      if (sendMode === 'all') {
        await sendToAll(data);
        alert(`Message sent to all users!`);
      } else {
        if (!selectedUser) return alert('Please select a user');
        await sendToUser({ ...data, userId: selectedUser });
        alert('Message sent!');
      }
      setSubject('');
      setMessage('');
    } catch (err) { alert(err.message); }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">📧 Email Broadcast</h1>

      {/* Brevo Accounts */}
      {stats?.accounts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {(stats.accounts || []).map((acc, i) => (
            <Card key={i}>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{acc.account}</p>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-2">{acc.keyPrefix}</p>
                <Badge variant={acc.isActive ? 'success' : 'default'}>
                  {acc.isActive ? '🟢 Active' : '⚪ Inactive'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Daily Usage */}
      {stats && (
        <Card className="mb-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Daily Usage</h3>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${(stats.usagePercent || 0) > 80 ? 'bg-red-500' : (stats.usagePercent || 0) > 50 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(stats.usagePercent || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-primary)] font-medium">
              {stats.sentToday || 0}/{stats.dailyLimit || 300} ({stats.usagePercent || 0}%)
            </span>
            <span className="text-[var(--text-muted)]">
              Remaining: {stats.remaining || 0} · Reachable: {stats.totalReachableUsers || 0}
            </span>
          </div>
        </Card>
      )}

      {/* Message Composer */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Send Message</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">To</label>
            <select value={sendMode} onChange={(e) => setSendMode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="all">All Users ({stats?.totalReachableUsers || 0} recipients)</option>
              <option value="user">Specific User</option>
            </select>
          </div>

          {sendMode === 'user' && (
            <div>
              <Input label="Search User" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Type to search..." />
              {userSearch && (
                <div className="max-h-32 overflow-y-auto border border-[var(--border-color)] rounded-lg mt-1">
                  {users
                    .filter(u => (u.fullName || `${u.firstName} ${u.lastName}` || u.email).toLowerCase().includes(userSearch.toLowerCase()))
                    .slice(0, 10)
                    .map(u => (
                      <button
                        key={u._id || u.id}
                        onClick={() => { setSelectedUser(u._id || u.id); setUserSearch(u.fullName || `${u.firstName} ${u.lastName}` || u.email); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)] ${selectedUser === (u._id || u.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                      >
                        {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()} ({u.email})
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          <Input label="From Name" value={fromName} onChange={(e) => setFromName(e.target.value)} />
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message (HTML)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y font-mono text-sm"
              placeholder="<h1>Hello</h1><p>Message content...</p>"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSend} loading={sending} size="lg">📧 Send Message</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}