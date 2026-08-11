import { useState, useEffect } from 'react';
import { getTotalUsage, getUsersUsage } from '../../services/farmvexa/usage';
import Card from '../../components/farmvexa/ui/Card';
import Badge from '../../components/farmvexa/ui/Badge';
import Spinner from '../../components/farmvexa/ui/Spinner';

export default function Usage() {
  const [total, setTotal] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTotalUsage(), getUsersUsage()])
      .then(([t, u]) => {
        setTotal(t?.data?.usage || t?.data || {});
        setUsers(u?.data?.users || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const maxRequests = Math.max(...users.map(u => u.usage?.today || 0), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Usage Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">Today</h2>
          <p className="text-3xl font-bold text-emerald-500">{total?.today || 0}</p>
          <p className="text-xs text-[var(--text-muted)]">requests today</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">All Time</h2>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{total?.total || 0}</p>
          <p className="text-xs text-[var(--text-muted)]">total requests</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Top Users Today</h2>
        {users.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No usage data.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-primary)]">{u.user?.name || u.user?.email}</span>
                  <span className="text-[var(--text-muted)]">{u.usage?.today || 0} today / {u.usage?.total || 0} total</span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${((u.usage?.today || 0) / maxRequests) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}