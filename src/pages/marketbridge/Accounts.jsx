import { useState, useEffect } from 'react';
import { getStats } from '../../services/marketbridge/dashboard';
import { getPayoutsList } from '../../services/marketbridge/orders';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';

export default function Accounts() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ total: 0, today: 0 });
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    Promise.all([
      getStats().catch(() => ({ data: { revenue: {} } })),
      getPayoutsList().catch(() => ({ data: { payouts: [] } })),
    ]).then(([statsRes, payoutsRes]) => {
      const stats = statsRes?.data || statsRes || {};
      const rev = stats.revenue || {};
      setRevenue({
        total: rev.total || 0,
        today: rev.today || 0,
      });

      const pData = payoutsRes?.data || payoutsRes || {};
      setPayouts(pData.payouts || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Calculate store balances from payouts
  const storeBalances = {};
  payouts.forEach(p => {
    const name = p.storeId?.name || 'Unknown';
    if (!storeBalances[name]) storeBalances[name] = { name, pending: 0, released: 0, commission: 0 };
    if (p.status === 'released') {
      storeBalances[name].released += (p.amount || 0);
      storeBalances[name].commission += (p.orderId?.financials?.platformCommission || 0);
    } else {
      storeBalances[name].pending += (p.amount || 0);
    }
  });

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">💳 Accounts</h1>

      {/* Platform Revenue */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-2xl font-bold text-green-600">KES {revenue.total.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Total Revenue</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-violet-600">KES {revenue.today.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Today</p>
        </Card>
      </div>

      {/* Store Balances */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Store Balances</h2>
        {Object.keys(storeBalances).length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No store balances yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-left">Released</th>
                  <th className="px-3 py-2 text-left">Commission</th>
                  <th className="px-3 py-2 text-left">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {Object.values(storeBalances).map(s => (
                  <tr key={s.name} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{s.name}</td>
                    <td className="px-3 py-2 text-green-600">KES {s.released.toLocaleString()}</td>
                    <td className="px-3 py-2 text-violet-600">KES {s.commission.toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">KES {(s.released).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Payouts */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Payouts</h2>
        {payouts.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No payouts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {payouts.slice(0, 10).map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{formatDate(p.releasedAt || p.createdAt)}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">{p.storeId?.name || '—'}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)] font-mono text-xs">{p.orderId?.orderNumber || '—'}</td>
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">KES {(p.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-2"><span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}