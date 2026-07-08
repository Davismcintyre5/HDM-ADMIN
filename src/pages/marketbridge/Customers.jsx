import { useState, useEffect } from 'react';
import { getCustomerStats, getCustomers, getCustomer, getCustomerOrders, suspendCustomer, activateCustomer, deleteCustomer } from '../../services/marketbridge/customers';
import Card from '../../components/marketbridge/ui/Card';
import Table from '../../components/marketbridge/ui/Table';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import SearchBar from '../../components/marketbridge/ui/SearchBar';
import Pagination from '../../components/marketbridge/ui/Pagination';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiEye, HiBan, HiCheck, HiTrash } from 'react-icons/hi';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '', name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, customer: null, orders: [], loading: false });

  useEffect(() => {
    getCustomerStats()
      .then(res => setStats(res?.data || res || {}))
      .catch(console.error);
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    getCustomers(params)
      .then(res => {
        const d = res?.data || res;
        setCustomers(Array.isArray(d) ? d : d.customers || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, [page, filter, search]);

  const openView = async (customer) => {
    setViewModal({ open: true, customer: null, orders: [], loading: true });
    try {
      const [cRes, oRes] = await Promise.all([
        getCustomer(customer._id),
        getCustomerOrders(customer._id).catch(() => ({ data: [] })),
      ]);
      setViewModal({ open: true, customer: cRes?.data || cRes, orders: oRes?.data || oRes || [], loading: false });
    } catch (e) {
      setViewModal({ open: true, customer, orders: [], loading: false });
    }
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendCustomer(confirm.id);
      else if (confirm.type === 'activate') await activateCustomer(confirm.id);
      else if (confirm.type === 'delete') await deleteCustomer(confirm.id);
      fetchCustomers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '', name: '' });
  };

  const columns = [
    { key: 'name', label: 'Name', render: row => (
      <button onClick={() => openView(row)} className="text-violet-600 hover:underline font-medium">{row.name || row.email || 'N/A'}</button>
    )},
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: row => row.phone || '—' },
    { key: 'status', label: 'Status', render: row => <Badge variant={row.status === 'active' ? 'success' : row.status === 'suspended' ? 'danger' : 'default'}>{row.status}</Badge> },
    { key: 'createdAt', label: 'Joined', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openView(row)}><HiEye className="w-4 h-4" /></Button>
        {row.status === 'active' && <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'suspend', name: row.name || row.email })}><HiBan className="w-4 h-4" /></Button>}
        {row.status === 'suspended' && <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'activate', name: row.name || row.email })}><HiCheck className="w-4 h-4" /></Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete', name: row.name || row.email })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'suspended', label: 'Suspended' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">👥 Customers</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'total', label: 'Total', color: 'text-blue-600' },
          { key: 'active', label: 'Active', color: 'text-green-600' },
          { key: 'suspended', label: 'Suspended', color: 'text-red-600' },
          { key: 'new', label: 'New Today', color: 'text-violet-600' },
        ].map(s => (
          <Card key={s.key}>
            <p className={`text-2xl font-bold ${s.color}`}>{stats[s.key] || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>{f.label}</button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." />
      </div>

      <Card>
        <Table columns={columns} data={customers} loading={loading} emptyMessage="No customers found." />
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, customer: null, orders: [], loading: false })} title="Customer Details" size="lg">
        {viewModal.loading ? (
          <div className="flex justify-center py-10"><Spinner size="md" /></div>
        ) : viewModal.customer ? (
          <div className="space-y-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.customer.name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.customer.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.customer.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={viewModal.customer.status === 'active' ? 'success' : 'danger'}>{viewModal.customer.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Joined:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.customer.createdAt)}</span></div>
            </div>
            {viewModal.orders.length > 0 && (
              <div>
                <h3 className="font-medium text-[var(--text-primary)] mb-2">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                      <tr><th className="px-2 py-1 text-left">Order</th><th className="px-2 py-1 text-left">Amount</th><th className="px-2 py-1 text-left">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {viewModal.orders.slice(0, 5).map(o => (
                        <tr key={o._id}>
                          <td className="px-2 py-1 text-[var(--text-primary)] text-xs">{o.orderId || o._id?.slice(-8)}</td>
                          <td className="px-2 py-1 text-[var(--text-primary)]">KES {(o.total || 0).toLocaleString()}</td>
                          <td className="px-2 py-1"><Badge variant="info">{o.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Customer not found</p>
        )}
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '', name: '' })} onConfirm={handleAction}
        title={confirm.type === 'suspend' ? 'Suspend Customer' : confirm.type === 'activate' ? 'Activate Customer' : 'Delete Customer'}
        message={confirm.type === 'delete' ? `Permanently delete ${confirm.name}?` : `${confirm.type === 'suspend' ? 'Suspend' : 'Activate'} ${confirm.name}?`}
        confirmLabel={confirm.type === 'suspend' ? 'Suspend' : confirm.type === 'activate' ? 'Activate' : 'Delete'}
        variant={confirm.type === 'delete' ? 'danger' : confirm.type === 'suspend' ? 'warning' : 'success'} loading={actionLoading} />
    </div>
  );
}