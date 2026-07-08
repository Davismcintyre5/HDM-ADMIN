import { useState, useEffect } from 'react';
import { getPendingStores, getStore, approveStore, rejectStore, permanentDeleteStore } from '../../services/marketbridge/stores';
import Card from '../../components/marketbridge/ui/Card';
import Table from '../../components/marketbridge/ui/Table';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Modal from '../../components/marketbridge/ui/Modal';
import Input from '../../components/marketbridge/ui/Input';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { formatDate } from '../../utils/marketbridge/formatDate';
import { HiCheck, HiX, HiEye, HiTrash } from 'react-icons/hi';

export default function PendingApprovals() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, store: null, loading: false });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApprove, setConfirmApprove] = useState({ open: false, id: null, name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const fetchStores = () => {
    setLoading(true);
    getPendingStores()
      .then(res => setStores(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, []);

  const openView = (store) => {
    setViewModal({ open: true, store: null, loading: true });
    getStore(store._id)
      .then(res => setViewModal({ open: true, store: res?.data || res, loading: false }))
      .catch(() => setViewModal({ open: true, store, loading: false }));
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try { await approveStore(confirmApprove.id); fetchStores(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    setConfirmApprove({ open: false, id: null, name: '' });
  };

  const handleReject = async () => {
    setActionLoading(true);
    try { await rejectStore(rejectModal.id, rejectReason); setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); fetchStores(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handlePermanentDelete = async () => {
    setActionLoading(true);
    try { await permanentDeleteStore(deleteConfirm.id); fetchStores(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
    setDeleteConfirm({ open: false, id: null, name: '' });
  };

  const columns = [
    { key: 'name', label: 'Store', render: row => (
      <button onClick={() => openView(row)} className="text-violet-600 hover:underline font-medium">{row.name || 'N/A'}</button>
    )},
    { key: 'vendorId', label: 'Owner', render: row => row.vendorId?.name || '—' },
    { key: 'vendorId.email', label: 'Email', render: row => row.vendorId?.email || '—' },
    { key: 'vendorId.phone', label: 'Phone', render: row => row.vendorId?.phone || '—' },
    { key: 'tier', label: 'Tier', render: row => <Badge variant="violet">{row.tier || 'basic'}</Badge> },
    { key: 'createdAt', label: 'Applied', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openView(row)}><HiEye className="w-4 h-4" /></Button>
        <Button size="sm" variant="success" onClick={() => setConfirmApprove({ open: true, id: row._id, name: row.name })}><HiCheck className="w-4 h-4" /> Approve</Button>
        <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, id: row._id, name: row.name })}><HiX className="w-4 h-4" /> Reject</Button>
        <Button size="sm" variant="danger" onClick={() => setDeleteConfirm({ open: true, id: row._id, name: row.name })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pending Approvals</h1>
      <Card>
        <Table columns={columns} data={stores} loading={loading} emptyMessage="No pending stores." />
      </Card>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, store: null, loading: false })} title="Store Details" size="lg">
        {viewModal.loading ? (
          <div className="flex justify-center py-10"><Spinner size="md" /></div>
        ) : viewModal.store ? (
          <div className="space-y-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Store:</span><span className="text-[var(--text-primary)] font-medium">{viewModal.store.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Subdomain:</span><span className="text-[var(--text-primary)]">{viewModal.store.subdomain}.marketbridge.co.ke</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Tier:</span><Badge variant="violet">{viewModal.store.tier}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant="warning">{viewModal.store.status}</Badge></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Description:</span><span className="text-[var(--text-primary)] text-xs">{viewModal.store.description || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Commission:</span><span className="text-[var(--text-primary)]">{viewModal.store.commissionRate || 10}%</span></div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-[var(--text-primary)]">Owner</h3>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)]">{viewModal.store.vendorId?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.store.vendorId?.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.store.vendorId?.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Applied:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.store.createdAt, 'full')}</span></div>
            </div>
            {viewModal.store.subscriptionExpiry && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-[var(--text-primary)]">Subscription</h3>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Expires:</span><span className="text-[var(--text-primary)]">{formatDate(viewModal.store.subscriptionExpiry)}</span></div>
              </div>
            )}
            {viewModal.store.features && (
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-[var(--text-primary)]">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Max Products:</span><span className="text-[var(--text-primary)]">{viewModal.store.features.maxProducts === 999999 ? 'Unlimited' : viewModal.store.features.maxProducts}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Vouchers:</span><Badge variant={viewModal.store.features.canCreateVouchers ? 'success' : 'default'}>{viewModal.store.features.canCreateVouchers ? 'Yes' : 'No'}</Badge></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Hot Deals:</span><Badge variant={viewModal.store.features.canCreateHotDeals ? 'success' : 'default'}>{viewModal.store.features.canCreateHotDeals ? 'Yes' : 'No'}</Badge></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Flash Sales:</span><Badge variant={viewModal.store.features.canRunFlashSales ? 'success' : 'default'}>{viewModal.store.features.canRunFlashSales ? 'Yes' : 'No'}</Badge></div>
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Boost New:</span><Badge variant={viewModal.store.features.canBoostNewArrivals ? 'success' : 'default'}>{viewModal.store.features.canBoostNewArrivals ? 'Yes' : 'No'}</Badge></div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="danger" onClick={() => { setViewModal({ open: false, store: null, loading: false }); setDeleteConfirm({ open: true, id: viewModal.store._id, name: viewModal.store.name }); }}>
                <HiTrash className="w-4 h-4 mr-1" /> Delete
              </Button>
              <Button variant="danger" onClick={() => { setViewModal({ open: false, store: null, loading: false }); setRejectModal({ open: true, id: viewModal.store._id, name: viewModal.store.name }); }}>
                <HiX className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button variant="success" onClick={() => { setViewModal({ open: false, store: null, loading: false }); setConfirmApprove({ open: true, id: viewModal.store._id, name: viewModal.store.name }); }}>
                <HiCheck className="w-4 h-4 mr-1" /> Approve
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">Store not found</p>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }} title={`Reject ${rejectModal.name}`}>
        <Input label="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setRejectModal({ open: false, id: null, name: '' }); setRejectReason(''); }}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button>
        </div>
      </Modal>

      <ConfirmDialog open={confirmApprove.open} onClose={() => setConfirmApprove({ open: false, id: null, name: '' })} onConfirm={handleApprove}
        title="Approve Store" message={`Approve ${confirmApprove.name}?`} confirmLabel="Approve" variant="success" loading={actionLoading} />
      <ConfirmDialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })} onConfirm={handlePermanentDelete}
        title="Permanently Delete Store" message={`Delete ${deleteConfirm.name} and all their data? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}