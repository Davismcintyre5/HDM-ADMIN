import { useEffect, useState } from 'react';
import { getAllOrders } from '../../services/docusoft/orders';
import { getSettings } from '../../services/docusoft/settings';
import Card from '../../components/docusoft/ui/Card';
import Table from '../../components/docusoft/ui/Table';
import Badge from '../../components/docusoft/ui/Badge';
import { formatDate } from '../../utils/docusoft/formatDate';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllOrders(), getSettings()])
      .then(([ord, sett]) => {
        setOrders(ord.data || ord || []);
        setSettings(sett.data || sett || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currency = settings?.currency || 'USD';
  const currencySymbol = settings?.currencySymbol || '$';

  const formatPrice = (price) => {
    if (currency === 'KES') return `${currencySymbol} ${price?.toLocaleString()}`;
    return `${currencySymbol}${price}`;
  };

  const columns = [
    { key: 'user', label: 'User', render: (row) => (
      <div>
        <div className="font-medium text-[var(--text-primary)]">{row.user?.name || 'N/A'}</div>
        <div className="text-xs text-[var(--text-muted)]">{row.user?.email}</div>
      </div>
    )},
    { key: 'items', label: 'Items', render: (row) => (
      <div className="space-y-1">
        {row.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="purple">{item.itemType}</Badge>
            <span className="text-sm text-[var(--text-primary)]">{item.title}</span>
            <span className="text-xs text-[var(--text-muted)]">{formatPrice(item.price)}</span>
          </div>
        ))}
      </div>
    )},
    { key: 'totalAmount', label: 'Total', render: (row) => (
      <span className="font-medium text-[var(--text-primary)]">{formatPrice(row.totalAmount || 0)}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'completed' ? 'success' : 'warning'}>{row.status}</Badge>
    )},
    { key: 'paymentMethod', label: 'Payment', render: (row) => (
      <span className="text-xs capitalize">{row.paymentMethod}</span>
    )},
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Orders</h1>
          <p className="text-sm text-[var(--text-muted)]">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={orders} loading={loading} emptyMessage="No orders yet." />
      </Card>
    </div>
  );
}