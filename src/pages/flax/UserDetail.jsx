import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser, getUserTransactions, updateUser, suspendUser, activateUser, resetUserPin } from '../../services/flax/users';
import Card from '../../components/flax/ui/Card';
import Badge from '../../components/flax/ui/Badge';
import Button from '../../components/flax/ui/Button';
import Input from '../../components/flax/ui/Input';
import Spinner from '../../components/flax/ui/Spinner';
import Modal from '../../components/flax/ui/Modal';
import ConfirmDialog from '../../components/flax/ui/ConfirmDialog';
import { formatDate } from '../../utils/flax/formatDate';
import { HiArrowLeft, HiBan, HiCheck, HiLockClosed, HiPencil } from 'react-icons/hi';

const typeConfig = {
  p2p_send:    { label: 'Sent',     icon: '↗️', variant: 'danger' },
  p2p_receive: { label: 'Received', icon: '↙️', variant: 'success' },
  fee:         { label: 'Fee',      icon: '⚙️', variant: 'default' },
  reversal:    { label: 'Reversal', icon: '↩️', variant: 'warning' },
};

const formatAmount = (amount, type) => {
  const prefix = type === 'p2p_send' ? '-' : type === 'p2p_receive' ? '+' : '';
  return `${prefix}KES ${(amount || 0).toLocaleString()}`;
};

const amountColor = (type) => {
  if (type === 'p2p_send') return 'text-red-600 dark:text-red-400';
  if (type === 'p2p_receive') return 'text-green-600 dark:text-green-400';
  return 'text-[var(--text-primary)]';
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, type: '' });
  const [form, setForm] = useState({ firstName: '', lastName: '', nationalId: '', phoneNumber: '' });

  const fetchUser = () => {
    setLoading(true);
    getUser(id)
      .then((u) => {
        const userData = u?.data?.user || u?.data || u;
        setUser(userData);
        if (userData) {
          setForm({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            nationalId: userData.nationalId || '',
            phoneNumber: userData.phoneNumber || '',
          });
          if (userData.phoneNumber) fetchTransactions(userData.phoneNumber);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchTransactions = (phoneNumber) => {
    setTxLoading(true);
    setTransactions([]);
    getUserTransactions(phoneNumber)
      .then((t) => {
        setTransactions(t?.transactions || t?.data?.transactions || []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setTxLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') await suspendUser(id);
      else if (confirm.type === 'activate') await activateUser(id);
      else if (confirm.type === 'resetPin') await resetUserPin(id);
      fetchUser();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
    setConfirm({ open: false, type: '' });
  };

  const handleEdit = async () => {
    setActionLoading(true);
    try {
      await updateUser(id, form);
      setEditModal(false);
      fetchUser();
    } catch (err) { alert(err.response?.data?.message || err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return <Card className="text-center text-[var(--text-muted)]">User not found</Card>;

  return (
    <div>
      <button onClick={() => navigate('/flax/users')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <HiArrowLeft /> Back to Users
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-[var(--text-muted)]">{user.phoneNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditModal(true)}><HiPencil className="w-4 h-4 mr-1" /> Edit</Button>
          {user.isActive ? (
            <Button variant="warning" onClick={() => setConfirm({ open: true, type: 'suspend' })}><HiBan className="w-4 h-4 mr-1" /> Suspend</Button>
          ) : (
            <Button variant="success" onClick={() => setConfirm({ open: true, type: 'activate' })}><HiCheck className="w-4 h-4 mr-1" /> Activate</Button>
          )}
          <Button variant="outline" onClick={() => setConfirm({ open: true, type: 'resetPin' })}><HiLockClosed className="w-4 h-4 mr-1" /> Reset PIN</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">User Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Name:</dt><dd className="text-[var(--text-primary)] font-medium">{user.firstName} {user.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Phone:</dt><dd className="text-[var(--text-primary)]">{user.phoneNumber}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">National ID:</dt><dd className="text-[var(--text-primary)]">{user.nationalId || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Suspended'}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Balance:</dt><dd className="text-[var(--text-primary)] font-bold">KES {(user.balance || 0).toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Joined:</dt><dd className="text-[var(--text-primary)]">{formatDate(user.createdAt)}</dd></div>
          </dl>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Transaction History</h2>
        {txLoading ? (
          <div className="flex justify-center py-10"><Spinner size="md" /></div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Fee</th>
                  <th className="px-3 py-2 text-left">Sender</th>
                  <th className="px-3 py-2 text-left">Recipient</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {transactions.map((tx, i) => {
                  const cfg = typeConfig[tx.type] || { label: tx.type, icon: '', variant: 'default' };
                  return (
                    <tr key={tx._id || tx.transactionId || i} className="hover:bg-[var(--bg-secondary)]">
                      <td className="px-3 py-2">
                        <Badge variant={cfg.variant}>{cfg.icon} {cfg.label}</Badge>
                      </td>
                      <td className={`px-3 py-2 font-semibold ${amountColor(tx.type)}`}>
                        {formatAmount(tx.amount, tx.type)}
                      </td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">
                        {tx.fee > 0 ? `KES ${tx.fee}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-[var(--text-primary)] text-xs">
                        {tx.senderName || tx.senderPhone || '—'}
                      </td>
                      <td className="px-3 py-2 text-[var(--text-primary)] text-xs">
                        {tx.recipientName || tx.recipientPhone || '—'}
                      </td>
                      <td className="px-3 py-2 text-[var(--text-secondary)] text-xs">
                        {formatDate(tx.createdAt, 'full')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit User" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <Input label="National ID" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button onClick={handleEdit} loading={actionLoading}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog open={confirm.open && confirm.type === 'suspend'} onClose={() => setConfirm({ open: false, type: '' })} onConfirm={handleAction}
        title="Suspend User" message="They will not be able to send money or login via USSD." confirmLabel="Suspend" variant="warning" loading={actionLoading} />
      <ConfirmDialog open={confirm.open && confirm.type === 'resetPin'} onClose={() => setConfirm({ open: false, type: '' })} onConfirm={handleAction}
        title="Reset PIN" message="Reset user PIN to 1234?" confirmLabel="Reset PIN" variant="warning" loading={actionLoading} />
    </div>
  );
}