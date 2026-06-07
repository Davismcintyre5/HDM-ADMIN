import { useEffect, useState } from 'react';
import { getBackups, createBackup, restoreBackup, deleteBackup, getSchedules, createSchedule } from '../../../services/bridge/backup';
import Card from '../../../components/bridge/ui/Card';
import Table from '../../../components/bridge/ui/Table';
import Badge from '../../../components/bridge/ui/Badge';
import Button from '../../../components/bridge/ui/Button';
import Modal from '../../../components/bridge/ui/Modal';
import Input from '../../../components/bridge/ui/Input';
import ConfirmDialog from '../../../components/bridge/ui/ConfirmDialog';
import { formatDate } from '../../../utils/bridge/formatDate';
import { HiRefresh, HiTrash, HiPlus, HiClock } from 'react-icons/hi';

export default function BackupSettings() {
  const [backups, setBackups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ name: '', frequency: 'daily', time: '02:00' });
  const [confirmRestore, setConfirmRestore] = useState({ open: false, id: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchData = () => {
    setLoading(true);
    Promise.all([getBackups(), getSchedules()])
      .then(([b, s]) => {
        setBackups(b.backups || b.data || []);
        setSchedules(s.schedules || s.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try { await createBackup(); fetchData(); alert('Backup created!'); }
    catch (err) { alert(err.message); }
    setCreating(false);
  };

  const handleRestore = async () => {
    try { await restoreBackup(confirmRestore.id); setConfirmRestore({ open: false, id: null }); alert('Restore initiated!'); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    try { await deleteBackup(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchData(); }
    catch (err) { alert(err.message); }
  };

  const handleCreateSchedule = async () => {
    try {
      await createSchedule({
        name: scheduleForm.name,
        type: 'database',
        scheduleConfig: {
          frequency: scheduleForm.frequency,
          time: scheduleForm.time,
          cronExpression: '0 ' + scheduleForm.time.split(':')[0] + ' * * *',
          day: '*',
          enabled: true,
        },
      });
      setScheduleModal(false);
      setScheduleForm({ name: '', frequency: 'daily', time: '02:00' });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const backupColumns = [
    { key: 'type', label: 'Type', render: (row) => <Badge variant="indigo">{row.type}</Badge> },
    { key: 'status', label: 'Status', render: (row) => (
      <Badge variant={row.status === 'completed' ? 'success' : 'warning'}>{row.status}</Badge>
    )},
    { key: 'storageType', label: 'Storage', render: (row) => <span className="text-xs capitalize">{row.storageType || 'local'}</span> },
    { key: 'compression', label: 'Compression', render: (row) => <span className="text-xs">{row.compression || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt, 'DD/MM/YYYY HH:mm') },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => setConfirmRestore({ open: true, id: row._id })}><HiRefresh className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  const scheduleColumns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'frequency', label: 'Frequency', render: (row) => <Badge variant="indigo">{row.scheduleConfig?.frequency || '—'}</Badge> },
    { key: 'time', label: 'Time', render: (row) => <span>{row.scheduleConfig?.time || '—'}</span> },
    { key: 'isScheduled', label: 'Status', render: (row) => row.isScheduled ? <Badge variant="success">Active</Badge> : <Badge variant="default">Paused</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Backups</h2>
        <Button onClick={handleCreate} loading={creating}><HiPlus className="w-4 h-4 mr-1" /> Create Backup</Button>
      </div>
      <Card>
        <Table columns={backupColumns} data={backups} loading={loading} emptyMessage="No backups yet." />
      </Card>

      <div className="flex items-center justify-between mt-6">
        <h3 className="text-lg font-semibold flex items-center gap-2"><HiClock className="w-5 h-5 text-indigo-600" /> Schedules</h3>
        <Button size="sm" variant="outline" onClick={() => setScheduleModal(true)}><HiPlus className="w-4 h-4 mr-1" /> Add Schedule</Button>
      </div>
      <Card>
        <Table columns={scheduleColumns} data={schedules} emptyMessage="No schedules." />
      </Card>

      <Modal open={scheduleModal} onClose={() => setScheduleModal(false)} title="Add Backup Schedule" size="sm">
        <div className="space-y-4">
          <Input label="Name" value={scheduleForm.name} onChange={(e) => setScheduleForm(p => ({ ...p, name: e.target.value }))} placeholder="Daily Backup" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Frequency</label>
            <select value={scheduleForm.frequency} onChange={(e) => setScheduleForm(p => ({ ...p, frequency: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <Input label="Time (HH:mm)" value={scheduleForm.time} onChange={(e) => setScheduleForm(p => ({ ...p, time: e.target.value }))} placeholder="02:00" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setScheduleModal(false)}>Cancel</Button>
            <Button onClick={handleCreateSchedule}>Create Schedule</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmRestore.open} onClose={() => setConfirmRestore({ open: false, id: null })} title="Restore Backup" message="Restore from this backup? Current data will be overwritten." confirmLabel="Restore" variant="warning" onConfirm={handleRestore} />
      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Backup" message="Permanently delete this backup?" confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}