import { useState, useEffect } from 'react';
import { getOrders, receiveOrder, qualityCheckOrder, dispatchOrder, deliverOrder, releasePayout, bulkReceive } from '../../services/marketbridge/orders';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import SearchBar from '../../components/marketbridge/ui/SearchBar';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Pagination from '../../components/marketbridge/ui/Pagination';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiCheck, HiX, HiTruck, HiClipboardCheck, HiPrinter } from 'react-icons/hi';

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending', color: 'yellow', icon: '⏳' },
  payment_confirmed: { label: 'Paid', color: 'blue', icon: '💳' },
  shipped_to_mb: { label: 'At Hub', color: 'blue', icon: '📦' },
  received_at_hub: { label: 'Received', color: 'blue', icon: '📦' },
  quality_checked: { label: 'QC Passed', color: 'green', icon: '✅' },
  out_for_delivery: { label: 'Dispatching', color: 'orange', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'green', icon: '📬' },
  received_at_pickup: { label: 'At Pickup Point', color: 'purple', icon: '📍' },
  picked_up: { label: 'Picked Up', color: 'green', icon: '✅' },
  reviewed: { label: 'Reviewed', color: 'teal', icon: '⭐' },
  cancelled: { label: 'Cancelled', color: 'red', icon: '❌' },
  refunded: { label: 'Refunded', color: 'gray', icon: '💰' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending_payment', label: 'Pending' },
  { key: 'payment_confirmed', label: 'Paid' },
  { key: 'shipped_to_mb', label: 'At Hub' },
  { key: 'received_at_hub', label: 'Received' },
  { key: 'quality_checked', label: 'QC Passed' },
  { key: 'out_for_delivery', label: 'Dispatching' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'received_at_pickup', label: 'At Pickup' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const BULK_STATUSES = ['shipped_to_mb'];
const PRINTABLE_STATUSES = ['quality_checked', 'out_for_delivery', 'delivered', 'received_at_pickup', 'picked_up'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk actions
  const [selected, setSelected] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Action modals
  const [qcModal, setQcModal] = useState({ open: false, id: null });
  const [qcForm, setQcForm] = useState({ passed: true, notes: '' });
  const [dispatchModal, setDispatchModal] = useState({ open: false, id: null });
  const [dispatchForm, setDispatchForm] = useState({ courier: '', trackingNumber: '' });
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });

  const fetchOrders = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search) params.search = search;
    getOrders(params)
      .then(res => {
        const d = res?.data || res;
        setOrders(Array.isArray(d) ? d : d.orders || []);
        setPagination(d.pagination || { page: 1, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, search]);
  useEffect(() => { setSelected([]); }, [statusFilter]);

  // Print delivery note
  const handlePrintDeliveryNote = (order) => {
    const itemsHtml = (order.items || []).map(item => `
      <div class="item">
        <span>${item.name} ${item.variant ? `(${item.variant})` : ''} x${item.quantity}</span>
        <span>KES ${(item.price || 0).toLocaleString()}</span>
      </div>
    `).join('');

    const note = `
      <html>
      <head>
        <title>Delivery Note - ${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 15px; max-width: 380px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .header h2 { margin: 0; font-size: 16px; }
          .header p { margin: 1px 0; font-size: 10px; color: #555; }
          .section { margin-bottom: 8px; }
          .section h3 { font-size: 11px; margin: 4px 0; text-transform: uppercase; border-bottom: 1px solid #ccc; }
          .row { display: flex; justify-content: space-between; font-size: 10px; padding: 1px 0; }
          .label { color: #555; }
          .value { font-weight: bold; text-align: right; max-width: 60%; }
          .items { margin-top: 8px; }
          .item { display: flex; justify-content: space-between; font-size: 10px; padding: 2px 0; border-bottom: 1px dotted #eee; }
          .total { font-size: 14px; font-weight: bold; margin-top: 8px; text-align: right; border-top: 2px solid #000; padding-top: 5px; }
          .footer { text-align: center; font-size: 9px; color: #999; margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 8px; }
          .barcode { text-align: center; font-size: 10px; font-family: monospace; margin-top: 5px; }
          @media print { body { padding: 0; margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📦 MarketBridge</h2>
          <p>Delivery Note</p>
          <p><strong>${order.orderNumber}</strong></p>
          <p>${new Date(order.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div class="section">
          <h3>👤 Customer</h3>
          <div class="row"><span class="label">Name:</span><span class="value">${order.buyerId?.name || 'N/A'}</span></div>
          <div class="row"><span class="label">Phone:</span><span class="value">${order.buyerId?.phone || order.shippingAddress?.phone || 'N/A'}</span></div>
          ${order.shippingAddress ? `
          <div class="row"><span class="label">Address:</span><span class="value">${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}</span></div>
          ${order.shippingAddress.county ? `<div class="row"><span class="label">County:</span><span class="value">${order.shippingAddress.county}</span></div>` : ''}
          ` : ''}
        </div>
        
        <div class="section">
          <h3>🏪 Store</h3>
          <div class="row"><span class="label">Name:</span><span class="value">${order.storeId?.name || 'N/A'}</span></div>
        </div>
        
        <div class="items">
          <h3>📋 Items</h3>
          ${itemsHtml}
        </div>
        
        <div class="total">
          Total: KES ${(order.financials?.totalPaid || 0).toLocaleString()}
        </div>
        
        ${order.trackingNumber ? `
        <div class="section">
          <h3>🚚 Tracking</h3>
          <div class="row"><span class="label">Courier:</span><span class="value">${order.courier || 'N/A'}</span></div>
          <div class="row"><span class="label">Tracking #:</span><span class="value">${order.trackingNumber}</span></div>
        </div>
        ` : ''}
        
        <div class="barcode">
          ${order.orderNumber}
        </div>
        
        <div class="footer">
          <p>MarketBridge — Delivery Note</p>
          <p>This is a computer-generated document</p>
        </div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    
    const win = window.open('', '_blank', 'width=420,height=700');
    win.document.write(note);
    win.document.close();
  };

  // Bulk
  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const bulkable = orders.filter(o => BULK_STATUSES.includes(o.status));
    if (selected.length === bulkable.length) setSelected([]);
    else setSelected(bulkable.map(o => o._id));
  };

  const handleBulkAction = async (type) => {
    if (selected.length === 0) return alert('Select orders first');
    if (!window.confirm(`${type === 'receive' ? 'Receive' : type} ${selected.length} orders?`)) return;
    setBulkLoading(true);
    try {
      if (type === 'receive') await bulkReceive(selected);
      setSelected([]);
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setBulkLoading(false);
  };

  // Single actions
  const handleAction = async (type, id) => {
    setActionLoading(true);
    try {
      if (type === 'receive') await receiveOrder(id);
      else if (type === 'deliver') await deliverOrder(id);
      else if (type === 'payout') await releasePayout(id);
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null, type: '' });
  };

  const handleQC = async () => {
    setActionLoading(true);
    try {
      await qualityCheckOrder(qcModal.id, qcForm);
      setQcModal({ open: false, id: null });
      setQcForm({ passed: true, notes: '' });
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const handleDispatch = async () => {
    setActionLoading(true);
    try {
      await dispatchOrder(dispatchModal.id, dispatchForm);
      setDispatchModal({ open: false, id: null });
      setDispatchForm({ courier: '', trackingNumber: '' });
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  const getActions = (order) => {
    const status = order.status;
    const printBtn = PRINTABLE_STATUSES.includes(status) ? (
      <Button size="sm" variant="ghost" onClick={() => handlePrintDeliveryNote(order)} title="Print Delivery Note">
        <HiPrinter className="w-4 h-4" />
      </Button>
    ) : null;

    switch (status) {
      case 'shipped_to_mb':
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="info" onClick={() => setConfirm({ open: true, id: order._id, type: 'receive' })}>
              <HiClipboardCheck className="w-4 h-4 mr-1" /> Receive
            </Button>
            {printBtn}
          </div>
        );
      case 'received_at_hub':
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="success" onClick={() => { setQcModal({ open: true, id: order._id }); setQcForm({ passed: true, notes: '' }); }}>
              <HiCheck className="w-4 h-4 mr-1" /> QC Pass
            </Button>
            <Button size="sm" variant="danger" onClick={() => { setQcModal({ open: true, id: order._id }); setQcForm({ passed: false, notes: '' }); }}>
              <HiX className="w-4 h-4 mr-1" /> QC Fail
            </Button>
            {printBtn}
          </div>
        );
      case 'quality_checked':
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="warning" onClick={() => { setDispatchModal({ open: true, id: order._id }); setDispatchForm({ courier: '', trackingNumber: '' }); }}>
              <HiTruck className="w-4 h-4 mr-1" /> Dispatch
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handlePrintDeliveryNote(order)} title="Print Delivery Note">
              <HiPrinter className="w-4 h-4" />
            </Button>
          </div>
        );
      case 'out_for_delivery':
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: order._id, type: 'deliver' })}>
              <HiCheck className="w-4 h-4 mr-1" /> Delivered
            </Button>
            {printBtn}
          </div>
        );
      case 'delivered': {
        const payoutReleased = order.financials?.payoutReleased || order.financials?.payoutStatus === 'released';
        return (
          <div className="flex gap-1">
            {payoutReleased ? (
              <Badge variant="success">KES {((order.financials?.storePayout || 0)).toLocaleString()} Released</Badge>
            ) : (
              <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: order._id, type: 'payout' })}>
                💰 Release Payout
              </Button>
            )}
            {printBtn}
          </div>
        );
      }
      default:
        return (
          <div className="flex gap-1">
            <Badge variant="default">{STATUS_CONFIG[status]?.label || status}</Badge>
            {printBtn}
          </div>
        );
    }
  };

  const stats = {};
  Object.keys(STATUS_CONFIG).forEach(k => { stats[k] = orders.filter(o => o.status === k).length; });
  const bulkable = orders.filter(o => BULK_STATUSES.includes(o.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">📦 Order Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'pending_payment', label: 'Pending', color: 'text-yellow-600' },
          { key: 'shipped_to_mb', label: 'At Hub', color: 'text-blue-600' },
          { key: 'received_at_hub', label: 'Received', color: 'text-blue-600' },
          { key: 'quality_checked', label: 'QC Passed', color: 'text-green-600' },
          { key: 'out_for_delivery', label: 'Dispatching', color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.key}>
            <p className={`text-2xl font-bold ${s.color}`}>{stats[s.key] || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex gap-2 overflow-x-auto flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setStatusFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === f.key ? 'bg-violet-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'}`}>{f.label}</button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search orders..." />
      </div>

      {/* Bulk Actions */}
      {bulkable.length > 0 && (
        <Card className="mb-4 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selected.length === bulkable.length && bulkable.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-violet-600 rounded"
                />
                <span className="text-sm text-[var(--text-secondary)]">Select All</span>
              </label>
              {selected.length > 0 && (
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  ({selected.length} selected)
                </span>
              )}
            </div>
            {selected.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="info" onClick={() => handleBulkAction('receive')} loading={bulkLoading}>
                  📦 Receive All
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
              <tr>
                <th className="px-3 py-2 text-left w-8">
                  <input 
                    type="checkbox" 
                    checked={bulkable.length > 0 && selected.length === bulkable.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-violet-600 rounded"
                  />
                </th>
                <th className="px-3 py-2 text-left">Order #</th>
                <th className="px-3 py-2 text-left">Store</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-[var(--text-muted)]">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-[var(--text-muted)]">No orders found.</td></tr>
              ) : (
                orders.map(row => {
                  const cfg = STATUS_CONFIG[row.status] || { label: row.status, color: 'default', icon: '' };
                  const isBulkable = BULK_STATUSES.includes(row.status);
                  return (
                    <tr key={row._id} className="hover:bg-[var(--bg-secondary)]">
                      <td className="px-3 py-2">
                        {isBulkable && (
                          <input 
                            type="checkbox" 
                            checked={selected.includes(row._id)}
                            onChange={() => toggleSelect(row._id)}
                            className="w-4 h-4 text-violet-600 rounded"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-medium text-[var(--text-primary)]">{row.orderNumber || 'N/A'}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">{row.storeId?.name || '—'}</td>
                      <td className="px-3 py-2 text-[var(--text-primary)]">{row.buyerId?.name || '—'}</td>
                      <td className="px-3 py-2 font-medium text-[var(--text-primary)]">KES {(row.financials?.totalPaid || 0).toLocaleString()}</td>
                      <td className="px-3 py-2"><Badge variant={cfg.color}>{cfg.icon} {cfg.label}</Badge></td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">{formatDate(row.createdAt)}</td>
                      <td className="px-3 py-2 text-right">{getActions(row)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </Card>

      {/* QC Modal */}
      <Modal open={qcModal.open} onClose={() => setQcModal({ open: false, id: null })} title={qcForm.passed ? '✅ QC Pass' : '❌ QC Fail'} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">{qcForm.passed ? 'Confirm this order passes quality check?' : 'This will cancel the order.'}</p>
          <Input label="Notes" value={qcForm.notes} onChange={e => setQcForm({ ...qcForm, notes: e.target.value })} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setQcModal({ open: false, id: null })}>Cancel</Button>
            <Button variant={qcForm.passed ? 'success' : 'danger'} onClick={handleQC} loading={actionLoading}>
              {qcForm.passed ? 'Pass QC' : 'Fail QC'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispatch Modal */}
      <Modal open={dispatchModal.open} onClose={() => setDispatchModal({ open: false, id: null })} title="🚚 Dispatch Order" size="sm">
        <div className="space-y-4">
          <Input label="Courier" value={dispatchForm.courier} onChange={e => setDispatchForm({ ...dispatchForm, courier: e.target.value })} placeholder="Fargo, G4S, etc." />
          <Input label="Tracking Number" value={dispatchForm.trackingNumber} onChange={e => setDispatchForm({ ...dispatchForm, trackingNumber: e.target.value })} placeholder="FA123456" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDispatchModal({ open: false, id: null })}>Cancel</Button>
            <Button variant="warning" onClick={handleDispatch} loading={actionLoading}>Dispatch</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm actions */}
      <ConfirmDialog open={confirm.open && confirm.type === 'receive'} onClose={() => setConfirm({ open: false, id: null, type: '' })} onConfirm={() => handleAction('receive', confirm.id)}
        title="📦 Receive at Hub" message="Confirm package received at hub?" confirmLabel="Receive" variant="info" loading={actionLoading} />
      <ConfirmDialog open={confirm.open && confirm.type === 'deliver'} onClose={() => setConfirm({ open: false, id: null, type: '' })} onConfirm={() => handleAction('deliver', confirm.id)}
        title="📬 Mark Delivered" message="Confirm this order has been delivered?" confirmLabel="Delivered" variant="success" loading={actionLoading} />
      <ConfirmDialog open={confirm.open && confirm.type === 'payout'} onClose={() => setConfirm({ open: false, id: null, type: '' })} onConfirm={() => handleAction('payout', confirm.id)}
        title="💰 Release Payout" message="Release the store payout for this order?" confirmLabel="Release Payout" variant="warning" loading={actionLoading} />
    </div>
  );
}