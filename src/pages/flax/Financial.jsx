import { useEffect, useState } from 'react';
import { getFinancial, getFinancialStats, updateFees, updateLimits, updateCurrency, getCosts, createCost, updateCost, deleteCost } from '../../services/flax/financial';
import Card from '../../components/flax/ui/Card';
import Input from '../../components/flax/ui/Input';
import Button from '../../components/flax/ui/Button';
import Badge from '../../components/flax/ui/Badge';
import Toggle from '../../components/flax/ui/Toggle';
import Modal from '../../components/flax/ui/Modal';
import ConfirmDialog from '../../components/flax/ui/ConfirmDialog';
import Spinner from '../../components/flax/ui/Spinner';
import { HiCash, HiChartBar, HiCurrencyDollar, HiCalculator, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const TABS = [
  { key: 'fees', label: 'Fees', icon: HiCash },
  { key: 'limits', label: 'Limits', icon: HiChartBar },
  { key: 'currency', label: 'Currency', icon: HiCurrencyDollar },
  { key: 'costs', label: 'Costs', icon: HiCalculator },
];

export default function Financial() {
  const [financial, setFinancial] = useState(null);
  const [stats, setStats] = useState(null);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fees');
  const [saving, setSaving] = useState(false);

  // Cost modal
  const [costModal, setCostModal] = useState({ open: false, mode: 'create', data: null });
  const [costForm, setCostForm] = useState({ minAmount: 0, maxAmount: 0, sendMoneyCost: 0, tillCost: 0, paybillCost: 0, isActive: true });
  const [costLoading, setCostLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getFinancial().catch(() => null),
      getFinancialStats().catch(() => null),
      getCosts().catch(() => ({ data: { costs: [] } })),
    ])
      .then(([f, s, c]) => {
        setFinancial(f?.data?.financial || f?.financial || {});
        setStats(s?.data || s);
        setCosts(c?.data?.costs || c?.costs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (fn, data) => {
    setSaving(true);
    try { await fn(data); alert('Saved!'); fetchData(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setSaving(false);
  };

  const openCreateCost = () => {
    setCostForm({ minAmount: 0, maxAmount: 0, sendMoneyCost: 0, tillCost: 0, paybillCost: 0, isActive: true });
    setCostModal({ open: true, mode: 'create', data: null });
  };

  const openEditCost = (cost) => {
    setCostForm({
      minAmount: cost.minAmount || 0,
      maxAmount: cost.maxAmount || 0,
      sendMoneyCost: cost.sendMoneyCost || 0,
      tillCost: cost.tillCost || 0,
      paybillCost: cost.paybillCost || 0,
      isActive: cost.isActive !== false,
    });
    setCostModal({ open: true, mode: 'edit', data: cost });
  };

  const handleSaveCost = async () => {
    setCostLoading(true);
    try {
      if (costModal.mode === 'create') await createCost(costForm);
      else await updateCost(costModal.data._id, costForm);
      setCostModal({ open: false, mode: 'create', data: null });
      fetchData();
    } catch (e) { alert(e.response?.data?.message || e.message); }
    setCostLoading(false);
  };

  const handleDeleteCost = async () => {
    setCostLoading(true);
    try { await deleteCost(deleteConfirm.id); fetchData(); setDeleteConfirm({ open: false, id: null }); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    setCostLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!financial) return null;

  const formatKES = (v) => `KES ${(v || 0).toLocaleString()}`;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Financial</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Total Tx', value: stats.totalTransactions },
            { label: 'Volume', value: formatKES(stats.totalVolume) },
            { label: 'Fees', value: formatKES(stats.totalFees) },
          ].map(s => (
            <Card key={s.label}>
              <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{s.value ?? 0}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* FEES TAB */}
      {activeTab === 'fees' && (
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Transaction Fees</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Send Money Flat Fee" type="number" value={financial.sendMoneyFlatFee || 0} onChange={(e) => setFinancial({ ...financial, sendMoneyFlatFee: +e.target.value })} />
            <Input label="Send Money % Fee" type="number" value={financial.sendMoneyPercentageFee || 0} onChange={(e) => setFinancial({ ...financial, sendMoneyPercentageFee: +e.target.value })} />
            <Input label="Withdrawal Flat Fee" type="number" value={financial.withdrawalFlatFee || 0} onChange={(e) => setFinancial({ ...financial, withdrawalFlatFee: +e.target.value })} />
            <Input label="Withdrawal % Fee" type="number" value={financial.withdrawalPercentageFee || 0} onChange={(e) => setFinancial({ ...financial, withdrawalPercentageFee: +e.target.value })} />
          </div>
          <Button className="mt-4" onClick={() => handleSave(updateFees, { sendMoneyFlatFee: financial.sendMoneyFlatFee, sendMoneyPercentageFee: financial.sendMoneyPercentageFee, withdrawalFlatFee: financial.withdrawalFlatFee, withdrawalPercentageFee: financial.withdrawalPercentageFee })} loading={saving}>Save Fees</Button>
        </Card>
      )}

      {/* LIMITS TAB */}
      {activeTab === 'limits' && (
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Transaction Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Send Amount" type="number" value={financial.minSendAmount || 0} onChange={(e) => setFinancial({ ...financial, minSendAmount: +e.target.value })} />
            <Input label="Max Send Amount" type="number" value={financial.maxSendAmount || 0} onChange={(e) => setFinancial({ ...financial, maxSendAmount: +e.target.value })} />
            <Input label="Max Daily Send" type="number" value={financial.maxDailySend || 0} onChange={(e) => setFinancial({ ...financial, maxDailySend: +e.target.value })} />
            <Input label="Max Per Transaction" type="number" value={financial.maxPerTransaction || 0} onChange={(e) => setFinancial({ ...financial, maxPerTransaction: +e.target.value })} />
          </div>
          <Button className="mt-4" onClick={() => handleSave(updateLimits, { minSendAmount: financial.minSendAmount, maxSendAmount: financial.maxSendAmount, maxDailySend: financial.maxDailySend, maxPerTransaction: financial.maxPerTransaction })} loading={saving}>Save Limits</Button>
        </Card>
      )}

      {/* CURRENCY TAB */}
      {activeTab === 'currency' && (
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Currency</h3>
          <Input label="Currency Code" value={financial.currency || 'KES'} onChange={(e) => setFinancial({ ...financial, currency: e.target.value })} />
          <Button className="mt-4" onClick={() => handleSave(updateCurrency, { currency: financial.currency })} loading={saving}>Save Currency</Button>
        </Card>
      )}

      {/* COSTS TAB */}
      {activeTab === 'costs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Transaction Cost Ranges</h3>
            <Button size="sm" onClick={openCreateCost}><HiPlus className="w-4 h-4 mr-1" /> Add Range</Button>
          </div>
          <Card>
            {costs.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">No cost ranges defined. Add one to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-3 py-2 text-left">Range</th>
                      <th className="px-3 py-2 text-left">Send Money</th>
                      <th className="px-3 py-2 text-left">Till</th>
                      <th className="px-3 py-2 text-left">Paybill</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {costs.map((c) => (
                      <tr key={c._id} className="hover:bg-[var(--bg-secondary)]">
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          {formatKES(c.minAmount)} - {formatKES(c.maxAmount)}
                        </td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">{formatKES(c.sendMoneyCost)}</td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">{formatKES(c.tillCost)}</td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">{formatKES(c.paybillCost)}</td>
                        <td className="px-3 py-2">
                          <Badge variant={c.isActive ? 'success' : 'default'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditCost(c)}><HiPencil className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ open: true, id: c._id })}><HiTrash className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Cost Modal */}
      <Modal open={costModal.open} onClose={() => setCostModal({ open: false, mode: 'create', data: null })} title={costModal.mode === 'create' ? 'Add Cost Range' : 'Edit Cost Range'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Amount (KES)" type="number" value={costForm.minAmount} onChange={(e) => setCostForm({ ...costForm, minAmount: +e.target.value })} />
            <Input label="Max Amount (KES)" type="number" value={costForm.maxAmount} onChange={(e) => setCostForm({ ...costForm, maxAmount: +e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Send Money Cost" type="number" value={costForm.sendMoneyCost} onChange={(e) => setCostForm({ ...costForm, sendMoneyCost: +e.target.value })} />
            <Input label="Till Cost" type="number" value={costForm.tillCost} onChange={(e) => setCostForm({ ...costForm, tillCost: +e.target.value })} />
            <Input label="Paybill Cost" type="number" value={costForm.paybillCost} onChange={(e) => setCostForm({ ...costForm, paybillCost: +e.target.value })} />
          </div>
          <Toggle label="Active" checked={costForm.isActive} onChange={(v) => setCostForm({ ...costForm, isActive: v })} />
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={() => setCostModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
            <Button onClick={handleSaveCost} loading={costLoading}>{costModal.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDeleteCost}
        title="Delete Cost Range"
        message="Are you sure you want to delete this cost range?"
        confirmLabel="Delete"
        variant="danger"
        loading={costLoading}
      />
    </div>
  );
}