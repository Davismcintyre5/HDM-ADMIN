import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, updateUserStatus } from '../../services/docusoft/users';
import Card from '../../components/docusoft/ui/Card';
import Table from '../../components/docusoft/ui/Table';
import Badge from '../../components/docusoft/ui/Badge';
import Button from '../../components/docusoft/ui/Button';
import ConfirmDialog from '../../components/docusoft/ui/ConfirmDialog';
import { formatDate } from '../../utils/docusoft/formatDate';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => setUsers(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'toggleStatus') {
        const user = users.find(u => u._id === confirm.id);
        await updateUserStatus(confirm.id, !user.isActive);
      } else if (confirm.type === 'toggleRole') {
        const user = users.find(u => u._id === confirm.id);
        await updateUserRole(confirm.id, user.role === 'admin' ? 'user' : 'admin');
      }
      setConfirm({ open: false, id: null, type: '' });
      fetchUsers();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role === 'admin' ? 'purple' : 'default'}>{row.role}</Badge> },
    { key: 'isActive', label: 'Status', render: (row) => row.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge> },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setConfirm({ open: true, id: row._id, type: 'toggleRole' })}>
          {row.role === 'admin' ? 'Make User' : 'Make Admin'}
        </Button>
        <Button size="sm" variant={row.isActive ? 'warning' : 'success'} onClick={() => setConfirm({ open: true, id: row._id, type: 'toggleStatus' })}>
          {row.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Users</h1>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users." />
      </Card>
      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, type: '' })}
        title={confirm.type === 'toggleRole' ? 'Change Role' : 'Change Status'}
        message={`Are you sure?`} confirmLabel="Confirm"
        variant="warning" onConfirm={handleAction} loading={actionLoading} />
    </div>
  );
}