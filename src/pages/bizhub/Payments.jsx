import { useEffect, useState } from 'react';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, togglePaymentMethod, deletePaymentMethod } from '../../services/bizhub/payments';
import Card from '../../components/bizhub/ui/Card';
import Table from '../../components/bizhub/ui/Table';
import Badge from '../../components/bizhub/ui/Badge';
import Button from '../../components/bizhub/ui/Button';
import Modal from '../../components/bizhub/ui/Modal';
import Input from '../../components/bizhub/ui/Input';
import Toggle from '../../components/bizhub/ui/Toggle';
import ConfirmDialog from '../../components/bizhub/ui/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

export default function Payments() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, method: null });
  const [form, setForm] = useState({ name: '', type: 'paybill', accountNumber: '', shortcode: '', active: true });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const fetchMethods = () => {
    setLoading(true);
    getPaymentMethods()
      .then(res => setMethods(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMethods(); }, []);

  const openCreate = () => { setForm({ name: '', type: 'paybill', accountNumber: '', shortcode: '', active: true }); setModal({ open: true, method: null }); };
  const openEdit = (m) => { setForm({ name: m.name, type: m.type, accountNumber: m.accountNumber, shortcode: m.shortcode, active: m.active }); setModal({ open: true, method: m }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.method) await updatePaymentMethod(modal.method._id, form);
      else await createPaymentMethod(form);
      setModal({ open: false, method: null });
      fetchMethods();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    try { await togglePaymentMethod(id); fetchMethods(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deletePaymentMethod(confirm.id); setConfirm({ open: false, id: null }); fetchMethods(); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'type', label: 'Type', render: (row) => <Badge variant="teal">{row.type}</Badge> },
    { key: 'accountNumber', label: 'Account', render: (row) => row.accountNumber || row.shortcode || '—' },
    { key: 'active', label: 'Status', render: (row) => (
      <button onClick={() => handleToggle(row._id)}>
        {row.active ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment Methods</h1>
        <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Method</Button>
      </div>
      <Card>
        <Table columns={columns} data={methods} loading={loading} emptyMessage="No payment methods." />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, method: null })} title={modal.method ? 'Edit Method' : 'Add Method'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="paybill">Paybill</option>
              <option value="till">Till</option>
              <option value="send_money">Send Money</option>
            </select>
          </div>
          <Input label="Account Number / Shortcode" value={form.accountNumber || form.shortcode} onChange={(e) => setForm(p => ({ ...p, accountNumber: e.target.value, shortcode: e.target.value }))} />
          <Toggle label="Active" checked={form.active} onChange={(v) => setForm(p => ({ ...p, active: v }))} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, method: null })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} title="Delete Method" message="Delete this payment method?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}