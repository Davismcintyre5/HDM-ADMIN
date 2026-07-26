import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, suspendUser, unsuspendUser, banUser, unbanUser, verifyUser, unverifyUser, deleteUser } from '../../services/rvnp/users';
import Card from '../../components/rvnp/ui/Card';
import Badge from '../../components/rvnp/ui/Badge';
import Button from '../../components/rvnp/ui/Button';
import Input from '../../components/rvnp/ui/Input';
import Modal from '../../components/rvnp/ui/Modal';
import ConfirmDialog from '../../components/rvnp/ui/ConfirmDialog';
import Spinner from '../../components/rvnp/ui/Spinner';
import { formatDate } from '../../utils/rvnp/formatDate';
import { HiArrowLeft, HiBadgeCheck, HiX } from 'react-icons/hi';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [banModal, setBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUser = () => {
    setLoading(true);
    getUser(id)
      .then(res => {
        const d = res.data || res;
        setUser(d.user || d);
        setStats(d.stats || {});
        setBadges(d.badges || []);
      })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try { await suspendUser(id, { reason: suspendReason, days: 7 }); setSuspendModal(false); fetchUser(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleUnsuspend = async () => {
    setActionLoading(true);
    try { await unsuspendUser(id); fetchUser(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleBan = async () => {
    setActionLoading(true);
    try { await banUser(id, { reason: banReason }); setBanModal(false); fetchUser(); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleUnban = async () => {
    setActionLoading(true);
    try { await unbanUser(id); fetchUser(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try { await verifyUser(id); fetchUser(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleUnverify = async () => {
    setActionLoading(true);
    try { await unverifyUser(id, { reason: 'Admin action' }); fetchUser(); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try { await deleteUser(id); navigate('/rvnp/users'); } catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return <div className="text-center py-20 text-[var(--text-muted)]">User not found.</div>;

  const status = user.isBanned ? 'Banned' : user.isSuspended ? 'Suspended' : 'Active';
  const statusVariant = { Active: 'success', Suspended: 'warning', Banned: 'danger' };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/rvnp/users')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{user.firstName} {user.lastName}</h1>
                {user.hdmVerified && <HiBadgeCheck className="w-6 h-6 text-emerald-500" title="HDM Verified" />}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
            </div>
          </div>
          <Badge variant={statusVariant[status]}>{status}</Badge>
        </div>
        <div className="flex gap-2">
          {!user.hdmVerified && <Button variant="success" onClick={handleVerify} loading={actionLoading}>Verify</Button>}
          {user.hdmVerified && <Button variant="warning" onClick={handleUnverify} loading={actionLoading}>Unverify</Button>}
          {user.isSuspended ? (
            <Button variant="success" onClick={handleUnsuspend} loading={actionLoading}>Unsuspend</Button>
          ) : (
            <Button variant="warning" onClick={() => setSuspendModal(true)} disabled={user.isBanned}>Suspend</Button>
          )}
          {user.isBanned ? (
            <Button variant="success" onClick={handleUnban} loading={actionLoading}>Unban</Button>
          ) : (
            <Button variant="danger" onClick={() => setBanModal(true)}>Ban</Button>
          )}
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={`${user.firstName} ${user.lastName}`} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone} />
            <Row label="Campus" value={user.campus} />
            <Row label="Department" value={user.department} capitalize />
            <Row label="Hostel" value={user.hostel?.replace(/_/g, ' ')} capitalize />
            <Row label="Bio" value={user.bio} />
            <Row label="Plan" value={user.plan} capitalize />
            <Row label="Online" value={user.isOnline ? 'Yes' : 'No'} />
            <Row label="Joined" value={formatDate(user.createdAt, 'full')} />
            <Row label="Last Seen" value={user.lastSeen ? formatDate(user.lastSeen, 'full') : '—'} />
          </div>
        </Card>

        {/* Stats & Limits */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Stats & Limits</h2>
          <div className="space-y-3 text-sm">
            <Row label="Posts" value={stats.posts} />
            <Row label="Listings" value={stats.listings} />
            <Row label="Max Listings" value={user.maxListings} />
            <Row label="Max Groups" value={user.maxGroups} />
            <Row label="Following" value={user.following?.length} />
            <Row label="Followers" value={user.followers?.length} />
            <Row label="Priority Support" value={user.prioritySupport ? 'Yes' : 'No'} />
            <Row label="Early Features" value={user.earlyFeatures ? 'Yes' : 'No'} />
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">Badges ({badges.length})</h2>
          {badges.length > 0 ? (
            <div className="space-y-2">
              {badges.map(b => (
                <div key={b._id} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{b.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{b.description}</p>
                    </div>
                  </div>
                  <Badge variant={b.isActive ? 'success' : 'default'}>{b.tier}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No badges earned.</p>
          )}
        </Card>
      </div>

      {/* Suspend Modal */}
      <Modal open={suspendModal} onClose={() => setSuspendModal(false)} title="Suspend User">
        <Input label="Reason" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSuspendModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleSuspend} loading={actionLoading}>Suspend</Button>
        </div>
      </Modal>

      {/* Ban Modal */}
      <Modal open={banModal} onClose={() => setBanModal(false)} title="Ban User">
        <Input label="Reason" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setBanModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBan} loading={actionLoading}>Ban</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete}
        title="Delete User" message={`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`}
        confirmLabel="Delete" variant="danger" loading={actionLoading} />
    </div>
  );
}

function Row({ label, value, capitalize }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`text-[var(--text-primary)] ${capitalize ? 'capitalize' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}