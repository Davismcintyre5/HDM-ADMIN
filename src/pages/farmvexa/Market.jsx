import { useState, useEffect } from 'react';
import { getMarketStatus, toggleMarket, getFarmers, getProducts, deleteProduct, getInquiries } from '../../services/farmvexa/market';
import Card from '../../components/farmvexa/ui/Card';
import Table from '../../components/farmvexa/ui/Table';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Toggle from '../../components/farmvexa/ui/Toggle';
import Modal from '../../components/farmvexa/ui/Modal';
import ConfirmDialog from '../../components/farmvexa/ui/ConfirmDialog';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { formatDate } from '../../utils/farmvexa/formatDate';
import { HiEye, HiTrash } from 'react-icons/hi';

const TABS = [
  { key: 'products', label: 'Products' },
  { key: 'inquiries', label: 'Inquiries' },
  { key: 'farmers', label: 'Farmers' },
];

export default function Market() {
  const [activeTab, setActiveTab] = useState('products');
  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, product: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

  const fetchData = () => {
    setLoading(true);
    const fetchers = {
      products: getProducts,
      inquiries: getInquiries,
      farmers: getFarmers,
    };
    Promise.all([getMarketStatus(), fetchers[activeTab]()])
      .then(([s, data]) => {
        setStatus(s?.data || s || {});
        if (activeTab === 'products') setProducts(data?.data?.products || data?.data || []);
        else if (activeTab === 'inquiries') setInquiries(data?.data?.inquiries || data?.data || []);
        else setFarmers(data?.data?.farmers || data?.data || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleToggle = async () => {
    setActionLoading(true);
    try { await toggleMarket(); fetchData(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteProduct(confirmDelete.id); setConfirmDelete({ open: false, id: null, name: '' }); fetchData(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const productColumns = [
    { key: 'name', label: 'Product', render: row => (
      <button onClick={() => setViewModal({ open: true, product: row })} className="text-emerald-600 hover:underline font-medium text-sm">{row.name || row.title}</button>
    )},
    { key: 'price', label: 'Price', render: row => <span className="text-sm">{row.price ? `${row.currency || 'KES'} ${row.price}` : '—'}</span> },
    { key: 'seller', label: 'Seller', render: row => <span className="text-sm">{row.seller?.name || row.farmer?.name || '—'}</span> },
    { key: 'status', label: 'Status', render: row => <Badge variant={row.status === 'active' ? 'success' : 'warning'}>{row.status || 'active'}</Badge> },
    { key: 'createdAt', label: 'Listed', render: row => formatDate(row.createdAt) },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, product: row })}><HiEye className="w-3 h-3" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id || row.id, name: row.name || row.title })}><HiTrash className="w-3 h-3" /></Button>
      </div>
    )},
  ];

  const inquiryColumns = [
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-sm">{row.name || row.buyer?.name}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email || row.buyer?.email}</span> },
    { key: 'product', label: 'Product', render: row => <span className="text-sm">{row.product?.name || row.productName || '—'}</span> },
    { key: 'message', label: 'Message', render: row => <span className="text-xs text-[var(--text-muted)]">{row.message?.substring(0, 60)}...</span> },
    { key: 'createdAt', label: 'Date', render: row => formatDate(row.createdAt) },
  ];

  const farmerColumns = [
    { key: 'name', label: 'Farmer', render: row => <span className="font-medium text-sm">{row.name || row.user?.name}</span> },
    { key: 'email', label: 'Email', render: row => <span className="text-sm text-[var(--text-secondary)]">{row.email || row.user?.email}</span> },
    { key: 'products', label: 'Products', render: row => <span className="text-sm">{row.productCount ?? row.products?.length ?? '—'}</span> },
    { key: 'joined', label: 'Joined', render: row => formatDate(row.createdAt || row.joinedAt) },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Marketplace</h1>
          <Badge variant={status?.enabled ? 'success' : 'danger'}>{status?.enabled ? 'Open' : 'Closed'}</Badge>
        </div>
        <Toggle checked={status?.enabled || false} onChange={handleToggle} label="Marketplace Enabled" />
      </div>

      <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-[var(--text-secondary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <Card>
          <Table columns={productColumns} data={products} loading={loading} emptyMessage="No products listed." />
        </Card>
      )}

      {activeTab === 'inquiries' && (
        <Card>
          <Table columns={inquiryColumns} data={inquiries} loading={loading} emptyMessage="No inquiries." />
        </Card>
      )}

      {activeTab === 'farmers' && (
        <Card>
          <Table columns={farmerColumns} data={farmers} loading={loading} emptyMessage="No farmers." />
        </Card>
      )}

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, product: null })} title="Product Details" size="md">
        {viewModal.product && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 text-sm">
            <Row label="Name" value={viewModal.product.name || viewModal.product.title} bold />
            <Row label="Price" value={viewModal.product.price ? `${viewModal.product.currency || 'KES'} ${viewModal.product.price}` : '—'} />
            <Row label="Description" value={viewModal.product.description} />
            <Row label="Seller" value={viewModal.product.seller?.name || viewModal.product.farmer?.name} />
            <Row label="Status" value={viewModal.product.status} />
            <Row label="Listed" value={formatDate(viewModal.product.createdAt, 'full')} />
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null, name: '' })} onConfirm={handleDelete}
        title="Delete Product" message={`Delete ${confirmDelete.name}?`} confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, bold }) {
  return <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className={`text-[var(--text-primary)] ${bold ? 'font-bold' : ''}`}>{value || '—'}</span></div>;
}