import { useState, useEffect } from 'react';
import { getCommissions, setDefaultCommission, setStoreCommission, deleteCommission } from '../../services/marketbridge/commissions';
import Card from '../../components/marketbridge/ui/Card';
import Badge from '../../components/marketbridge/ui/Badge';
import Button from '../../components/marketbridge/ui/Button';
import Input from '../../components/marketbridge/ui/Input';
import Modal from '../../components/marketbridge/ui/Modal';
import ConfirmDialog from '../../components/marketbridge/ui/ConfirmDialog';
import Spinner from '../../components/marketbridge/ui/Spinner';
import { HiTrash, HiPlus } from 'react-icons/hi';

export default function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultRate, setDefaultRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [storeModal, setStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState({ storeId: '', rate: '' });

  const fetchCommissions = () => {
    setLoading(true);
    getCommissions()
      .then(res => setCommissions(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCommissions(); }, []);

  const defaultCommission = commissions.find(c => c.type === 'default');
  const storeCommissions = commissions.filter(c => c.type === 'store');
  const categoryCommissions = commissions.filter(c => c.type === 'category');

  const handleSetDefault = async () => {
    if (!defaultRate) return;
    setSaving(true);
    try { await setDefaultCommission(parseFloat(defaultRate)); setDefaultRate(''); fetchCommissions(); alert('Default rate updated!'); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const handleAddStore = async () => {
    if (!storeForm.storeId || !storeForm.rate) return alert('Fill all fields');
    setActionLoading(true);
    try { await setStoreCommission(storeForm.storeId, parseFloat(storeForm.rate)); setStoreModal(false); setStoreForm({ storeId: '', rate: '' }); fetchCommissions(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteCommission(confirm.id); fetchCommissions(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
    setConfirm({ open: false, id: null });
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Commissions</h1>

      {/* Default Rate */}
      <Card className="mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Default Commission Rate</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Applies to all stores unless overridden below.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input label="Rate (%)" type="number" value={defaultRate || (defaultCommission?.rate || 10)} 
              onChange={e => setDefaultRate(e.target.value)} placeholder="10" min="0" max="100" />
          </div>
          <Button onClick={handleSetDefault} loading={saving} className="mt-6">Update Default</Button>
        </div>
        {defaultCommission && (
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
            Current default: <strong>{defaultCommission.rate}%</strong>
          </div>
        )}
      </Card>

      {/* Store-Specific Rates */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Store-Specific Rates</h2>
          <Button size="sm" onClick={() => setStoreModal(true)}><HiPlus className="w-4 h-4 mr-1" /> Add Store Rate</Button>
        </div>
        {storeCommissions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No store-specific rates. All stores use default.</p>
        ) : (
          <div className="space-y-2">
            {storeCommissions.map(c => (
              <div key={c._id || c.id} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <div>
                  <span className="text-[var(--text-primary)] font-medium">{c.store?.name || c.storeId || 'Unknown Store'}</span>
                  <Badge variant="violet" className="ml-2">Store</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-primary)] font-bold">{c.rate}%</span>
                  <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: c._id || c.id })}><HiTrash className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Category-Specific Rates */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Category-Specific Rates</h2>
        {categoryCommissions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No category-specific rates. All categories use default or store rate.</p>
        ) : (
          <div className="space-y-2">
            {categoryCommissions.map(c => (
              <div key={c._id || c.id} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
                <div>
                  <span className="text-[var(--text-primary)] font-medium">{c.category?.name || c.categoryId || 'Unknown Category'}</span>
                  <Badge variant="info" className="ml-2">Category</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-primary)] font-bold">{c.rate}%</span>
                  <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: c._id || c.id })}><HiTrash className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Store Modal */}
      <Modal open={storeModal} onClose={() => setStoreModal(false)} title="Add Store Commission" size="sm">
        <div className="space-y-4">
          <Input label="Store ID" value={storeForm.storeId} onChange={e => setStoreForm({ ...storeForm, storeId: e.target.value })} placeholder="Enter store ID" />
          <Input label="Rate (%)" type="number" value={storeForm.rate} onChange={e => setStoreForm({ ...storeForm, rate: e.target.value })} placeholder="5" min="0" max="100" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStoreModal(false)}>Cancel</Button>
            <Button onClick={handleAddStore} loading={actionLoading}>Add</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete Rule" message="Delete this commission rule?" confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}