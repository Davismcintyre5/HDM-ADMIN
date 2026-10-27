import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiLockClosed,
  HiLockOpen,
  HiSave,
  HiShieldCheck,
  HiTrash,
  HiExclamation,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Modal from '../../components/tvetgrid/ui/Modal';
import Textarea from '../../components/tvetgrid/ui/Textarea';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { useAuth } from '../../context/tvetgrid/AuthContext';
import {
  getUser,
  updateUser,
  changeUserRole,
  disableUser,
  enableUser,
  permanentDeleteUser,
} from '../../services/tvetgrid/users';
import { formatDate, formatDateTime } from '../../utils/tvetgrid/formatDate';
import { USER_ROLE_LIST, statusLabel } from '../../utils/tvetgrid/constants';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: me } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [roleOpen, setRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState('student');
  const [changingRole, setChangingRole] = useState(false);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disableReason, setDisableReason] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const meId = me?.id || me?._id;
  const isMe = meId && (meId === id || meId === user?._id || meId === user?.id);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getUser(id);
      const u = res?.data || res;
      setUser(u);
      setName(u.name || '');
      setPhone(u.phone || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load user');
      navigate('/tvetgrid/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateUser(id, { name: name.trim(), phone: phone.trim() });
      const updated = res?.data || res;
      if (updated) setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeRole = async () => {
    if (newRole === user.role) {
      setRoleOpen(false);
      return;
    }
    setChangingRole(true);
    try {
      await changeUserRole(id, newRole);
      toast.success(`Role changed to ${statusLabel(newRole)}`);
      setRoleOpen(false);
      load();
    } catch (err) {
      if (err.code === 'SELF_DEMOTE') {
        toast.error('You cannot change your own role');
      } else {
        toast.error(err.message || 'Failed to change role');
      }
    } finally {
      setChangingRole(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      await disableUser(id, disableReason.trim() || undefined);
      toast.success('User disabled');
      setDisableOpen(false);
      setDisableReason('');
      load();
    } catch (err) {
      if (err.code === 'SELF_DISABLE') {
        toast.error('You cannot disable yourself');
      } else {
        toast.error(err.message || 'Failed to disable');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEnable = async () => {
    setBusy(true);
    try {
      await enableUser(id);
      toast.success('User enabled');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to enable');
    } finally {
      setBusy(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (deleteConfirm !== user.email) return;
    setDeleting(true);
    try {
      const res = await permanentDeleteUser(id);
      const d = res?.data?.deleted || {};
      toast.success(
        `User deleted — ${d.attempts || 0} attempts, ${d.progress || 0} progress, ${d.invites || 0} invites, ${d.hostedMeetings || 0} meetings`
      );
      navigate('/tvetgrid/users');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/users')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {user.name || 'User'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              user.role === 'admin'
                ? 'warning'
                : user.role === 'teacher'
                ? 'info'
                : 'default'
            }
          >
            {statusLabel(user.role)}
          </Badge>
          <Badge variant={user.isActive ? 'success' : 'danger'} dot>
            {user.isActive ? 'Active' : 'Disabled'}
          </Badge>
          {isMe && <Badge variant="info">You</Badge>}
        </div>
      </div>

      <Card title="Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            value={user.email}
            disabled
            hint="Cannot be changed"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="254712345678"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              icon={<HiSave className="w-4 h-4" />}
              loading={savingProfile}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Access & permissions">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-3 items-center">
            <span className="text-[var(--text-secondary)]">Role</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'warning'
                    : user.role === 'teacher'
                    ? 'info'
                    : 'default'
                }
              >
                {statusLabel(user.role)}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                icon={<HiShieldCheck className="w-3.5 h-3.5" />}
                onClick={() => {
                  setNewRole(user.role);
                  setRoleOpen(true);
                }}
                disabled={isMe}
                title={isMe ? 'Cannot change your own role' : undefined}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex justify-between gap-3 items-center">
            <span className="text-[var(--text-secondary)]">Account</span>
            {user.isActive ? (
              <Button
                size="sm"
                variant="warning"
                icon={<HiLockClosed className="w-3.5 h-3.5" />}
                onClick={() => setDisableOpen(true)}
                disabled={busy || isMe}
                title={isMe ? 'Cannot disable yourself' : undefined}
              >
                Disable
              </Button>
            ) : (
              <Button
                size="sm"
                variant="success"
                icon={<HiLockOpen className="w-3.5 h-3.5" />}
                onClick={handleEnable}
                loading={busy}
              >
                Enable
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--text-secondary)] text-xs">User ID</dt>
            <dd className="text-[var(--text-primary)] text-xs font-mono break-all">
              {user._id || user.id}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--text-secondary)] text-xs">Email verified</dt>
            <dd className="text-[var(--text-primary)] text-xs">
              {user.emailVerified ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--text-secondary)] text-xs">Created</dt>
            <dd className="text-[var(--text-primary)] text-xs">
              {user.createdAt ? formatDate(user.createdAt, 'full') : '—'}
            </dd>
          </div>
          {user.lastLoginAt && (
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--text-secondary)] text-xs">Last login</dt>
              <dd className="text-[var(--text-primary)] text-xs">
                {formatDateTime(user.lastLoginAt)}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Danger zone */}
      {!isMe && (
        <div className="border border-red-200 dark:border-red-800 rounded-xl overflow-hidden">
          <div className="bg-red-50 dark:bg-red-950/30 px-5 py-3 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <HiExclamation className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm">
                Danger zone
              </h3>
            </div>
          </div>
          <div className="p-5 bg-[var(--bg-primary)]">
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
              Permanently delete user
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Permanently removes this user and all their data: paper attempts, revision progress,
              meeting invitations, and (if a teacher) meetings they hosted. This cannot be undone.
            </p>
            <Button
              variant="danger"
              icon={<HiTrash className="w-4 h-4" />}
              onClick={() => {
                setDeleteConfirm('');
                setDeleteOpen(true);
              }}
            >
              Permanently delete
            </Button>
          </div>
        </div>
      )}

      {/* Change role modal */}
      <Modal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="Change role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              loading={changingRole}
              disabled={newRole === user.role}
            >
              Change role
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Change <strong>{user.name}</strong>'s role. This affects what they can access in the platform.
        </p>
        <Select
          label="New role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          options={USER_ROLE_LIST}
        />
      </Modal>

      {/* Disable user modal */}
      <Modal
        open={disableOpen}
        onClose={() => {
          setDisableOpen(false);
          setDisableReason('');
        }}
        title="Disable user"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDisableOpen(false);
                setDisableReason('');
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDisable} loading={busy}>
              Disable
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Disable <strong>{user.name}</strong>? They won't be able to log in until re-enabled.
          An email will be sent to them.
        </p>
        <Textarea
          label="Reason"
          hint="Optional, sent to the user by email"
          value={disableReason}
          onChange={(e) => setDisableReason(e.target.value)}
          rows={2}
          placeholder="e.g. Terms violation"
        />
      </Modal>

      {/* Permanent delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirm('');
        }}
        title="Permanently delete user"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handlePermanentDelete}
              disabled={deleteConfirm !== user.email}
              loading={deleting}
            >
              Delete Forever
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            <p className="font-medium mb-1">This cannot be undone.</p>
            <p>The following will be permanently deleted:</p>
            <ul className="mt-2 ml-4 list-disc space-y-0.5">
              <li>Their account and login credentials</li>
              <li>All paper attempts and scores</li>
              <li>All revision progress</li>
              <li>All meeting invitations</li>
              {user.role === 'teacher' && (
                <li>All meetings they hosted and their invitations</li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Type <strong className="font-mono text-[var(--text-primary)]">{user.email}</strong> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={user.email}
              className="font-mono"
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}