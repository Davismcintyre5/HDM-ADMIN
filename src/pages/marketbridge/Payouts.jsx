import { useState, useEffect } from 'react';
import { getPayoutsList, releasePayout, getOrders } from '../../services/marketbridge/orders';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState({ totalAmount: 0, totalCommission: 0, pendingAmount: 0 });
  const [confirm, setConfirm] = useState({ open: false, id: null, orderNumber: '' });

const fetchData = () => {
  setLoading(true);
  Promise.all([
    getPayoutsList().catch(() => ({ data: { payouts: [], totalAmount: 0, totalCommission: 0 } })),
    getOrders({ limit: 200 }).catch(() => ({ data: [] })),
  ]).then(([payoutsRes, ordersRes]) => {
    const pData = payoutsRes?.data || payoutsRes || {};
    const allPayouts = pData.payouts || [];
    
    // Released payouts
    setPayouts(allPayouts.filter(p => p.status === 'released'));
    
    // Pending payouts - check ALL orders (not just delivered), filter by payoutStatus
    const orders = ordersRes?.data || ordersRes || [];
    const pending = Array.isArray(orders) 
      ? orders.filter(o => 
          o.financials?.payoutStatus === 'pending' && 
          !o.financials?.payoutReleased
        )
      : [];
    setPendingPayouts(pending);

    // Calculate totals
    const totalAmount = allPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCommission = allPayouts.reduce((sum, p) => sum + (p.orderId?.financials?.platformCommission || 0), 0);
    const pendingAmount = pending.reduce((sum, o) => sum + (o.financials?.storePayout || 0), 0);

    setSummary({ totalAmount, totalCommission, pendingAmount });
  }).catch(console.error).finally(() => setLoading(false));
};

  useEffect(() => { fetchData(); }, []);

  const handleRelease = async () => {
    setActionLoading(true);
    try {
      await releasePayout(confirm.id);
      setConfirm({ open: false, id: null, orderNumber: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">💰 Payouts</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-2xl font-bold text-green-600">KES {summary.totalAmount.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Total Released</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-violet-600">KES {summary.totalCommission.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Commission</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-yellow-600">KES {summary.pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-[var(--text-muted)]">Pending</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-blue-600">{pendingPayouts.length}</p>
          <p className="text-xs text-[var(--text-muted)]">Awaiting Release</p>
        </Card>
      </div>

      {/* Pending Payouts */}
      {pendingPayouts.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">⏳ Pending Payouts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Payout</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {pendingPayouts.map(order => (
                  <tr key={order._id} className="hover:bg-[var(--bg-secondary)] bg-yellow-50 dark:bg-yellow-900/10">
                    <td className="px-3 py-2 font-mono text-xs font-medium text-[var(--text-primary)]">{order.orderNumber || 'N/A'}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">{order.storeId?.name || '—'}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">{order.buyerId?.name || '—'}</td>
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">KES {(order.financials?.storePayout || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: order._id, orderNumber: order.orderNumber })}>
                        💰 Release Payout
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Released Payouts */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">✅ Released Payouts</h2>
        {payouts.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No released payouts yet.</p>
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
                {payouts.map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{formatDate(p.releasedAt || p.createdAt)}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)]">{p.storeId?.name || '—'}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)] font-mono text-xs">{p.orderId?.orderNumber || '—'}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)] font-medium">KES {(p.amount || 0).toLocaleString()}</td>
                    <td className="px-3 py-2"><Badge variant="success">Released</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog 
        open={confirm.open} 
        onClose={() => setConfirm({ open: false, id: null, orderNumber: '' })} 
        onConfirm={handleRelease}
        title="💰 Release Payout" 
        message={`Release payout for order ${confirm.orderNumber}?`} 
        confirmLabel="Release Payout" 
        variant="warning" 
        loading={actionLoading} 
      />
    </div>
  );
}