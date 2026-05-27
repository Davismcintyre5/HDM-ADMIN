import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser, banUser, unbanUser, forceLogout, deleteUserPermanently } from '../../services/spark/users';
import Card from '../../components/spark/ui/Card';
import Badge from '../../components/spark/ui/Badge';
import Button from '../../components/spark/ui/Button';
import Spinner from '../../components/spark/ui/Spinner';
import Modal from '../../components/spark/ui/Modal';
import Input from '../../components/spark/ui/Input';
import ConfirmDialog from '../../components/spark/ui/ConfirmDialog';
import { formatDate } from '../../utils/spark/formatDate';
import { HiArrowLeft } from 'react-icons/hi';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banModal, setBanModal] = useState(false);
  const [banForm, setBanForm] = useState({ type: 'temporary', reason: 'Violation of terms', durationDays: 7 });
  const [confirmAction, setConfirmAction] = useState({ open: false, type: '' });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = () => {
    setLoading(true);
    getUser(id)
      .then(data => setUser(data.user || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleBan = async () => {
    if (!banForm.reason?.trim()) {
      alert('Please enter a reason for the ban');
      return;
    }
    setActionLoading(true);
    try { await banUser(id, banForm); setBanModal(false); fetchUser(); }
    catch (err) {
      if (err.message?.includes('already banned')) {
        alert('User is already banned. Refreshing...');
        setBanModal(false);
        fetchUser();
      } else {
        alert(err.message);
      }
    }
    setActionLoading(false);
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirmAction.type === 'unban') await unbanUser(id, { reason: 'Admin action' });
      else if (confirmAction.type === 'logout') await forceLogout(id);
      setConfirmAction({ open: false, type: '' });
      fetchUser();
    } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handlePermanentDelete = async () => {
    const identifier = user?.phone || user?.email || '';
    if (deleteConfirm !== identifier) {
      alert('Phone/email does not match');
      return;
    }
    setActionLoading(true);
    try { await deleteUserPermanently(id); navigate('/spark/users'); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return <Card className="text-center text-red-500">User not found</Card>;

  const isBanned = user?.bans?.some(b => b.isActive) || user?.status === 'banned';
  const displayStatus = isBanned ? 'banned' : (user?.status || 'offline');
  const statusV = { online: 'success', offline: 'default', banned: 'danger' };
  const userIdentifier = user.phone || user.email || 'N/A';

  return (
    <div>
      <button onClick={() => navigate('/spark/users')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <HiArrowLeft /> Back to Users
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{user.displayName || userIdentifier}</h1>
        <div className="flex gap-2 flex-wrap">
          {!isBanned && <Button variant="danger" onClick={() => setBanModal(true)}>Ban</Button>}
          {isBanned && <Button variant="success" onClick={() => setConfirmAction({ open: true, type: 'unban' })}>Unban</Button>}
          <Button variant="warning" onClick={() => setConfirmAction({ open: true, type: 'logout' })}>Force Logout</Button>
          <Button variant="danger" onClick={() => { setDeleteConfirm(''); setDeleteModal(true); }}>Delete Permanently</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Display Name:</dt><dd className="text-[var(--text-primary)]">{user.displayName || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Phone:</dt><dd className="text-[var(--text-primary)]">{user.phone || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Email:</dt><dd className="text-[var(--text-primary)]">{user.email || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Status:</dt><dd><Badge variant={statusV[displayStatus] || 'default'}>{displayStatus}</Badge></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">HDM Verified:</dt><dd>{user.isHdmVerified ? <Badge variant="sky">✓ {user.hdmVerifiedPlan}</Badge> : <Badge>No</Badge>}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Bio:</dt><dd className="text-[var(--text-primary)]">{user.bio || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Joined:</dt><dd className="text-[var(--text-primary)]">{formatDate(user.createdAt, 'full')}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Last Seen:</dt><dd className="text-[var(--text-primary)]">{formatDate(user.lastSeen, 'full')}</dd></div>
          </dl>
        </Card>

        {user.bans?.length > 0 && (
          <Card>
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Bans ({user.bans.length})</h2>
            <div className="space-y-2">
              {user.bans.map(b => (
                <div key={b._id} className="bg-[var(--bg-secondary)] rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <Badge variant={b.isActive ? 'danger' : 'default'}>{b.isActive ? 'Active' : 'Lifted'}</Badge>
                    <Badge variant="sky">{b.type}</Badge>
                  </div>
                  <p className="text-[var(--text-primary)] mt-1">{b.reason || 'No reason'}</p>
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                    <span>Expires: {formatDate(b.expiresAt, 'DD/MM/YYYY HH:mm')}</span>
                    <span>{formatDate(b.createdAt, 'DD/MM/YYYY')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {user.sessions?.length > 0 && (
          <Card><h2 className="font-semibold text-[var(--text-primary)] mb-4">Sessions ({user.sessions.length})</h2></Card>
        )}
        {user.payments?.length > 0 && (
          <Card><h2 className="font-semibold text-[var(--text-primary)] mb-4">Payments ({user.payments.length})</h2></Card>
        )}
        {user.reports?.length > 0 && (
          <Card><h2 className="font-semibold text-[var(--text-primary)] mb-4">Reports ({user.reports.length})</h2></Card>
        )}
      </div>

      <Modal open={banModal} onClose={() => setBanModal(false)} title="Ban User" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
            <select value={banForm.type} onChange={(e) => setBanForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm">
              <option value="temporary">Temporary</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          {banForm.type === 'temporary' && <Input label="Duration (Days)" type="number" value={banForm.durationDays} onChange={(e) => setBanForm(p => ({ ...p, durationDays: Number(e.target.value) }))} />}
          <Input label="Reason *" value={banForm.reason} onChange={(e) => setBanForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for ban (required)" />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setBanModal(false)}>Cancel</Button><Button variant="danger" onClick={handleBan} loading={actionLoading}>Ban</Button></div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, type: '' })}
        title={confirmAction.type === 'unban' ? 'Unban User' : 'Force Logout'}
        message={confirmAction.type === 'unban' ? 'Remove ban from this user?' : 'Log out all sessions for this user?'}
        confirmLabel={confirmAction.type === 'unban' ? 'Unban' : 'Logout'}
        variant={confirmAction.type === 'unban' ? 'success' : 'warning'}
        onConfirm={handleAction}
        loading={actionLoading}
      />

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Permanently" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
            <p className="font-medium mb-2">⚠ This will permanently delete:</p>
            <ul className="list-disc ml-4 space-y-1 text-xs">
              <li>User account</li><li>All messages sent by user</li><li>All chats, contacts, statuses</li>
              <li>All call records</li><li>All payments & pending activations</li>
              <li>All sessions & notifications</li><li>All reports & bans</li><li>Avatar from storage</li>
            </ul>
            <p className="mt-2 font-medium">This action CANNOT be undone.</p>
          </div>
          <Input label={`Type "${userIdentifier}" to confirm`} value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={userIdentifier} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handlePermanentDelete} loading={actionLoading} disabled={deleteConfirm !== userIdentifier}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}