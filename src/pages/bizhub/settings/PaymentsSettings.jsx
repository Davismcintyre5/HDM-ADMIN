import { useEffect, useState } from 'react';
import { getPaymentMethods, togglePaymentMethod, deletePaymentMethod } from '../../../services/bizhub/payments';
import Card from '../../../components/bizhub/ui/Card';
import Table from '../../../components/bizhub/ui/Table';
import Badge from '../../../components/bizhub/ui/Badge';
import Button from '../../../components/bizhub/ui/Button';
import ConfirmDialog from '../../../components/bizhub/ui/ConfirmDialog';
import { HiTrash } from 'react-icons/hi';

export default function PaymentsSettingsTab() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    getPaymentMethods()
      .then(res => setMethods(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try { await togglePaymentMethod(id); setMethods(prev => prev.map(m => m._id === id ? { ...m, active: !m.active } : m)); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deletePaymentMethod(confirm.id); setConfirm({ open: false, id: null }); setMethods(prev => prev.filter(m => m._id !== confirm.id)); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'type', label: 'Type', render: (row) => <Badge variant="teal">{row.type}</Badge> },
    { key: 'active', label: 'Status', render: (row) => (
      <button onClick={() => handleToggle(row._id)}>
        {row.active ? <Badge variant="success">Active</Badge> : <Badge variant="default">Inactive</Badge>}
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div>
      <Card>
        <Table columns={columns} data={methods} loading={loading} emptyMessage="No payment methods." />
      </Card>
      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} title="Delete Method" message="Delete this payment method?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}