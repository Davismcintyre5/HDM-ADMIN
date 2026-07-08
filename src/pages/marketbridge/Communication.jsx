import { useState, useEffect } from 'react';
import { sendToAllStores, sendToStore, sendToAllUsers, sendToUser } from '../../services/marketbridge/communication';
import { getStores } from '../../services/marketbridge/stores';
import { getCustomers } from '../../services/marketbridge/customers';
import Card from '../../components/marketbridge/ui/Card';
import Input from '../../components/marketbridge/ui/Input';
import Button from '../../components/marketbridge/ui/Button';
import Badge from '../../components/marketbridge/ui/Badge';

export default function Communication() {
  const [target, setTarget] = useState('all_stores');
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [channel, setChannel] = useState(['email']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = target.includes('store')
          ? await getStores({ search, limit: 10 })
          : await getCustomers({ search, limit: 10 });
        setSearchResults(res?.data || res || []);
      } catch (e) { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, target]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return alert('Subject and message required');
    setSending(true);
    setResult(null);
    try {
      const data = { subject: subject.trim(), message: message.trim(), channel: channel.join(',') };
      let res;
      if (target === 'all_stores') res = await sendToAllStores(data);
      else if (target === 'all_users') res = await sendToAllUsers(data);
      else if (target === 'store') res = await sendToStore(selectedId, data);
      else if (target === 'user') res = await sendToUser(selectedId, data);
      setResult(res?.data || res);
      setSubject(''); setMessage('');
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setSending(false);
  };

  const toggleChannel = (ch) => {
    setChannel(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">📢 Communication</h1>

      <Card className="space-y-4 mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-2">Send Message</h2>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Target</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'all_stores', label: 'All Stores' },
              { key: 'all_users', label: 'All Users' },
              { key: 'store', label: 'Specific Store' },
              { key: 'user', label: 'Specific User' },
            ].map(t => (
              <button key={t.key} onClick={() => { setTarget(t.key); setSelectedId(''); setSearch(''); setSearchResults([]); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${target === t.key ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search for specific */}
        {(target === 'store' || target === 'user') && (
          <div>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${target === 'store' ? 'stores' : 'users'}...`} />
            {searchResults.length > 0 && (
              <div className="mt-2 border border-[var(--border-color)] rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map(item => (
                  <button key={item._id} onClick={() => { setSelectedId(item._id); setSearch(target === 'store' ? item.name : item.name || item.email); setSearchResults([]); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] ${selectedId === item._id ? 'bg-violet-50 dark:bg-violet-900/20' : ''}`}>
                    {item.name || item.email} {item.email && <span className="text-[var(--text-muted)] text-xs">({item.email})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Channel</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={channel.includes('email')} onChange={() => toggleChannel('email')} className="w-4 h-4 text-violet-600 rounded" />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={channel.includes('sms')} onChange={() => toggleChannel('sms')} className="w-4 h-4 text-violet-600 rounded" />
              <span className="text-sm">SMS</span>
            </label>
          </div>
        </div>

        {/* Subject & Message */}
        <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject..." />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-violet-500 resize-y text-sm"
            placeholder="Your message..." />
        </div>

        <Button onClick={handleSend} loading={sending}>Send Message</Button>

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
            ✅ Message sent to {result.sent || result.count || 0} {target.includes('store') ? 'stores' : 'users'}.
          </div>
        )}
      </Card>
    </div>
  );
}