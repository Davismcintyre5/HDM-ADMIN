import { useEffect, useState } from 'react';
import { getDevices, lockDevice, unlockDevice, deleteDevice } from '../../services/vault/devices';
import Card from '../../components/vault/ui/Card';
import Table from '../../components/vault/ui/Table';
import Badge from '../../components/vault/ui/Badge';
import Button from '../../components/vault/ui/Button';
import ConfirmDialog from '../../components/vault/ui/ConfirmDialog';
import Pagination from '../../components/vault/ui/Pagination';
import { formatDate } from '../../utils/vault/formatDate';

export default function Devices() {
  const [data, setData] = useState({ devices: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDevices = () => {
    setLoading(true);
    getDevices({ page, limit: 20 })
      .then(res => setData({ devices: res.devices || [], total: res.total || 0 }))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevices(); }, [page]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'lock') await lockDevice(confirm.id);
      else if (confirm.type === 'unlock') await unlockDevice(confirm.id);
      else await deleteDevice(confirm.id);
      setConfirm({ open: false, id: null, type: '' });
      fetchDevices();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'deviceName', label: 'Device', render: (row) => <span className="font-medium">{row.deviceName || row.platform || 'Unknown'}</span> },
    { key: 'platform', label: 'Platform', render: (row) => <Badge variant="orange">{row.platform}</Badge> },
    { key: 'deviceType', label: 'Type', render: (row) => <span className="text-xs capitalize">{row.deviceType}</span> },
    { key: 'isLocked', label: 'Status', render: (row) => row.isLocked ? <Badge variant="danger">Locked</Badge> : <Badge variant="success">Active</Badge> },
    { key: 'lastSeen', label: 'Last Seen', render: (row) => formatDate(row.lastSeen) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        {row.isLocked ? <Button size="sm" variant="success" onClick={() => setConfirm({ open: true, id: row._id, type: 'unlock' })}>Unlock</Button>
          : <Button size="sm" variant="warning" onClick={() => setConfirm({ open: true, id: row._id, type: 'lock' })}>Lock</Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: row._id, type: 'delete' })}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Devices</h1>
      <Card>
        <Table columns={columns} data={data.devices} loading={loading} emptyMessage="No devices." />
        <Pagination page={page} totalPages={Math.ceil(data.total / 20) || 1} onPageChange={setPage} />
      </Card>
      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'lock' ? 'Lock Device' : confirm.type === 'unlock' ? 'Unlock Device' : 'Delete Device'}
        message={`${confirm.type === 'delete' ? 'Permanently delete' : confirm.type} this device?`}
        confirmLabel={confirm.type === 'lock' ? 'Lock' : confirm.type === 'unlock' ? 'Unlock' : 'Delete'}
        variant={confirm.type === 'delete' ? 'danger' : 'warning'} onConfirm={handleAction} loading={actionLoading} />
    </div>
  );
}