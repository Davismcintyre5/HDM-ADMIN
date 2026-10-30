import { useEffect, useState } from 'react';
import {
  getSenders,
  createSender,
  updateSender,
  approveSender,
  rejectSender,
  setDefaultSender,
  deleteSender,
} from '../../services/bridge/senders';
import {
  listClientSendersForReview,
  approveClientSender,
  rejectClientSender,
} from '../../services/bridge/clientSenderReviews';
import Card from '../../components/bridge/ui/Card';
import Table from '../../components/bridge/ui/Table';
import Badge from '../../components/bridge/ui/Badge';
import Button from '../../components/bridge/ui/Button';
import Modal from '../../components/bridge/ui/Modal';
import Input from '../../components/bridge/ui/Input';
import Toggle from '../../components/bridge/ui/Toggle';
import Spinner from '../../components/bridge/ui/Spinner';
import PageHeader from '../../components/bridge/ui/PageHeader';
import { formatDate } from '../../utils/bridge/formatDate';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiStar } from 'react-icons/hi';

export default function Senders() {
  /* ── Platform pool state ───────────────────────────────────── */
  const [grouped, setGrouped] = useState({ verified: [], pending: [], rejected: [] });
  const [defaultSender, setDefaultSender] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Customer submissions state ────────────────────────────── */
  const [clientPending, setClientPending] = useState([]);
  const [clientRejected, setClientRejected] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [showClientRejected, setShowClientRejected] = useState(false);

  /* ── Modals ────────────────────────────────────────────────── */
  const [addModal, setAddModal] = useState({ open: false, loading: false, form: { name: '', email: '', description: '', verifiedInBrevo: false } });
  const [editModal, setEditModal] = useState({ open: false, sender: null, loading: false, form: { name: '', email: '', description: '', isActive: true } });
  const [approveModal, setApproveModal] = useState({ open: false, sender: null, confirmed: false, loading: false });
  const [rejectModal, setRejectModal] = useState({ open: false, sender: null, reason: '', loading: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, sender: null, loading: false });
  const [showRejected, setShowRejected] = useState(false);

  /* ── Client review modals ──────────────────────────────────── */
  const [clientApproveModal, setClientApproveModal] = useState({ open: false, sender: null, loading: false });
  const [clientRejectModal, setClientRejectModal] = useState({ open: false, sender: null, reason: '', loading: false });

  /* ── Loaders ───────────────────────────────────────────────── */
  const refreshPlatform = async () => {
    setLoading(true);
    try {
      const res = await getSenders();
      setGrouped(res.grouped || { verified: [], pending: [], rejected: [] });
      setDefaultSender(res.defaultSender || null);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshClientReviews = async () => {
    setClientLoading(true);
    try {
      const res = await listClientSendersForReview();
      setClientPending(res.grouped?.pending || []);
      setClientRejected(res.grouped?.rejected || []);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setClientLoading(false);
    }
  };

  const refresh = () => Promise.all([refreshPlatform(), refreshClientReviews()]);

  useEffect(() => { refresh(); }, []);

  /* ── Platform pool actions ─────────────────────────────────── */
  const openAdd = () => {
    setAddModal({ open: true, loading: false, form: { name: '', email: '', description: '', verifiedInBrevo: false } });
  };

  const submitAdd = async () => {
    const f = addModal.form;
    if (!f.name.trim() || !f.email.trim()) return;
    setAddModal((s) => ({ ...s, loading: true }));
    try {
      await createSender({
        name: f.name.trim(),
        email: f.email.trim(),
        description: f.description.trim() || undefined,
        verifiedInBrevo: f.verifiedInBrevo,
      });
      setAddModal((s) => ({ ...s, open: false, loading: false }));
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setAddModal((s) => ({ ...s, loading: false }));
    }
  };

  const openEdit = (sender) => {
    setEditModal({
      open: true,
      sender,
      loading: false,
      form: {
        name: sender.name || '',
        email: sender.email || '',
        description: sender.description || '',
        isActive: sender.isActive !== false,
      },
    });
  };

  const submitEdit = async () => {
    const f = editModal.form;
    if (!f.name.trim() || !f.email.trim()) return;
    setEditModal((s) => ({ ...s, loading: true }));
    try {
      await updateSender(editModal.sender._id, {
        name: f.name.trim(),
        email: f.email.trim(),
        description: f.description.trim() || undefined,
        isActive: f.isActive,
      });
      setEditModal((s) => ({ ...s, open: false, loading: false }));
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setEditModal((s) => ({ ...s, loading: false }));
    }
  };

  const openApprove = (sender) => setApproveModal({ open: true, sender, confirmed: false, loading: false });

  const submitApprove = async () => {
    if (!approveModal.confirmed) return;
    setApproveModal((s) => ({ ...s, loading: true }));
    try {
      await approveSender(approveModal.sender._id);
      setApproveModal((s) => ({ ...s, open: false, loading: false }));
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setApproveModal((s) => ({ ...s, loading: false }));
    }
  };

  const openReject = (sender) => setRejectModal({ open: true, sender, reason: '', loading: false });

  const submitReject = async () => {
    if (!rejectModal.reason.trim()) return;
    setRejectModal((s) => ({ ...s, loading: true }));
    try {
      await rejectSender(rejectModal.sender._id, rejectModal.reason.trim());
      setRejectModal((s) => ({ ...s, open: false, loading: false }));
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setRejectModal((s) => ({ ...s, loading: false }));
    }
  };

  const submitSetDefault = async (sender) => {
    try {
      await setDefaultSender(sender._id);
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const openDelete = (sender) => setDeleteModal({ open: true, sender, loading: false });

  const submitDelete = async () => {
    setDeleteModal((s) => ({ ...s, loading: true }));
    try {
      await deleteSender(deleteModal.sender._id);
      setDeleteModal((s) => ({ ...s, open: false, loading: false }));
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setDeleteModal((s) => ({ ...s, loading: false }));
    }
  };

  const submitDeactivateInstead = async () => {
    setDeleteModal((s) => ({ ...s, loading: true }));
    try {
      await updateSender(deleteModal.sender._id, { isActive: false });
      setDeleteModal((s) => ({ ...s, open: false, loading: false }));
      await refreshPlatform();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setDeleteModal((s) => ({ ...s, loading: false }));
    }
  };

  /* ── Client review actions ─────────────────────────────────── */
  const openClientApprove = (sender) => setClientApproveModal({ open: true, sender, loading: false });

  const submitClientApprove = async () => {
    setClientApproveModal((s) => ({ ...s, loading: true }));
    try {
      await approveClientSender(clientApproveModal.sender._id);
      setClientApproveModal({ open: false, sender: null, loading: false });
      await refreshClientReviews();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setClientApproveModal((s) => ({ ...s, loading: false }));
    }
  };

  const openClientReject = (sender) => setClientRejectModal({ open: true, sender, reason: '', loading: false });

  const submitClientReject = async () => {
    if (!clientRejectModal.reason.trim()) return;
    setClientRejectModal((s) => ({ ...s, loading: true }));
    try {
      await rejectClientSender(clientRejectModal.sender._id, clientRejectModal.reason.trim());
      setClientRejectModal({ open: false, sender: null, reason: '', loading: false });
      await refreshClientReviews();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setClientRejectModal((s) => ({ ...s, loading: false }));
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  const verifiedColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-primary)]">{row.name}</span>
          {row._id === defaultSender?._id && <Badge variant="indigo">Default</Badge>}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="font-mono text-xs text-[var(--text-secondary)]">{row.email}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => <span className="text-xs text-[var(--text-muted)]">{row.description || '—'}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Live' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          {row._id !== defaultSender?._id && row.isActive && (
            <Button size="sm" variant="secondary" title="Set as default" onClick={() => submitSetDefault(row)}>
              <HiStar className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="secondary" title="Edit" onClick={() => openEdit(row)}>
            <HiPencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="danger" title="Delete" onClick={() => openDelete(row)}>
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Senders"
        description="Platform pool and customer submissions"
      />

      {/* ────────────────────────────────────────────────────────
          CUSTOMER SUBMISSIONS — pending/rejected client senders
          ──────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Customer submissions ({clientPending.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Senders submitted by customers awaiting your approval. Approval enables them for that customer only.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={refreshClientReviews} loading={clientLoading}>
            Refresh
          </Button>
        </div>

        {clientLoading ? (
          <div className="flex justify-center py-4"><Spinner size="sm" /></div>
        ) : clientPending.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">
            No pending senders. When customers submit senders for approval, they'll appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {clientPending.map((s) => (
              <div key={s._id} className="p-4 bg-[var(--bg-secondary)] rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="text-sm font-mono text-[var(--text-secondary)] break-all">{s.email}</p>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[var(--text-muted)]">
                      <p>
                        <span className="text-[var(--text-secondary)]">Organization:</span>{' '}
                        {s.organizationId?.name || '—'}
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)]">Submitted by:</span>{' '}
                        {s.userId?.name || s.userId?.email || '—'}
                      </p>
                      <p>
                        <span className="text-[var(--text-secondary)]">Submitted:</span>{' '}
                        {formatDate(s.reviewSubmittedAt || s.createdAt)}
                      </p>
                      {s.domain && (
                        <p>
                          <span className="text-[var(--text-secondary)]">Domain:</span>{' '}
                          <span className="font-mono">{s.domain}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="success" onClick={() => openClientApprove(s)}>
                      <HiCheck className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => openClientReject(s)}>
                      <HiX className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejected sub-section */}
        <div className="mt-6 border-t border-[var(--border-color)] pt-4">
          <button
            type="button"
            onClick={() => setShowClientRejected(!showClientRejected)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <h4 className="font-medium text-sm text-[var(--text-primary)]">
                Rejected submissions ({clientRejected.length})
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Rejected customer sender applications.
              </p>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {showClientRejected ? 'Hide' : 'Show'}
            </span>
          </button>

          {showClientRejected && (
            <div className="mt-3 space-y-2">
              {clientRejected.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No rejected senders.</p>
              ) : (
                clientRejected.map((s) => (
                  <div key={s._id} className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                      <Badge variant="danger">Rejected</Badge>
                    </div>
                    <p className="text-xs font-mono text-[var(--text-secondary)] break-all">{s.email}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {s.organizationId?.name || '—'}
                      {s.userId?.name || s.userId?.email
                        ? ` · ${s.userId?.name || s.userId?.email}`
                        : ''}
                    </p>
                    {s.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {s.rejectionReason}</p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Rejected {s.rejectedAt ? formatDate(s.rejectedAt) : '—'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ────────────────────────────────────────────────────────
          PLATFORM POOL — default card + verified table
          ──────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
              Default platform sender
            </h3>
            {defaultSender ? (
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{defaultSender.name}</p>
                <p className="text-sm text-[var(--text-secondary)] font-mono">{defaultSender.email}</p>
                {defaultSender.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1">{defaultSender.description}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No default sender set. Verified senders can be promoted to default.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Platform senders</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Verified addresses customers can use in their "from" field.
            </p>
          </div>
          <Button size="sm" onClick={openAdd}>
            <HiPlus className="w-4 h-4 mr-1" /> Add sender
          </Button>
        </div>
        <Table
          columns={verifiedColumns}
          data={grouped.verified}
          emptyMessage="No verified platform senders yet. Add one to get started."
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Pending platform senders ({grouped.pending.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Platform senders awaiting verification.
            </p>
          </div>
        </div>

        {grouped.pending.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">
            No pending platform senders. Add one above to make it available to all customers.
          </p>
        ) : (
          <div className="space-y-3">
            {grouped.pending.map((s) => (
              <div key={s._id} className="p-4 bg-[var(--bg-secondary)] rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                    <p className="text-sm font-mono text-[var(--text-secondary)]">{s.email}</p>
                    {s.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{s.description}</p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Added {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="success" onClick={() => openApprove(s)}>
                      <HiCheck className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => openReject(s)}>
                      <HiX className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <button
          onClick={() => setShowRejected(!showRejected)}
          className="w-full flex items-center justify-between"
          type="button"
        >
          <div className="text-left">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Rejected platform senders ({grouped.rejected.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Rejected platform sender applications.
            </p>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {showRejected ? 'Hide' : 'Show'}
          </span>
        </button>

        {showRejected && (
          <div className="mt-4 space-y-2">
            {grouped.rejected.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No rejected senders.</p>
            ) : (
              grouped.rejected.map((s) => (
                <div key={s._id} className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
                  <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                  <p className="text-xs font-mono text-[var(--text-secondary)]">{s.email}</p>
                  {s.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {s.rejectionReason}</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Rejected {s.rejectedAt ? formatDate(s.rejectedAt) : '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* ────────────────────────────────────────────────────────
          ALL MODALS
          ──────────────────────────────────────────────────────── */}

      {/* Add platform sender */}
      <Modal open={addModal.open} onClose={() => setAddModal((s) => ({ ...s, open: false }))} title="Add platform sender" size="md">
        <div className="space-y-4">
          <Input
            label="Name"
            value={addModal.form.name}
            onChange={(e) => setAddModal((s) => ({ ...s, form: { ...s.form, name: e.target.value } }))}
            placeholder="HDM BRIDGE Notifications"
          />
          <Input
            label="Email"
            type="email"
            value={addModal.form.email}
            onChange={(e) => setAddModal((s) => ({ ...s, form: { ...s.form, email: e.target.value } }))}
            placeholder="noreply@hdmbridge.com"
          />
          <Input
            label="Description"
            value={addModal.form.description}
            onChange={(e) => setAddModal((s) => ({ ...s, form: { ...s.form, description: e.target.value } }))}
            placeholder="Use for transactional emails"
          />
          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
            <Toggle
              label="Already verified this sender in Brevo"
              checked={addModal.form.verifiedInBrevo}
              onChange={(v) => setAddModal((s) => ({ ...s, form: { ...s.form, verifiedInBrevo: v } }))}
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {addModal.form.verifiedInBrevo
                ? 'Sender will be added as live immediately.'
                : 'Sender will be added to pending verification.'}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={submitAdd} loading={addModal.loading}>
              Add sender
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit platform sender */}
      <Modal open={editModal.open} onClose={() => setEditModal((s) => ({ ...s, open: false }))} title="Edit sender" size="md">
        <div className="space-y-4">
          <Input
            label="Name"
            value={editModal.form.name}
            onChange={(e) => setEditModal((s) => ({ ...s, form: { ...s.form, name: e.target.value } }))}
          />
          <Input
            label="Email"
            type="email"
            value={editModal.form.email}
            onChange={(e) => setEditModal((s) => ({ ...s, form: { ...s.form, email: e.target.value } }))}
          />
          <Input
            label="Description"
            value={editModal.form.description}
            onChange={(e) => setEditModal((s) => ({ ...s, form: { ...s.form, description: e.target.value } }))}
          />
          <Toggle
            label="Active — available to customers"
            checked={editModal.form.isActive}
            onChange={(v) => setEditModal((s) => ({ ...s, form: { ...s.form, isActive: v } }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditModal((s) => ({ ...s, open: false }))}>
              Cancel
            </Button>
            <Button onClick={submitEdit} loading={editModal.loading}>
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve platform sender */}
      <Modal open={approveModal.open} onClose={() => setApproveModal((s) => ({ ...s, open: false }))} title="Approve platform sender" size="md">
        {approveModal.sender && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <p className="font-medium text-[var(--text-primary)]">{approveModal.sender.name}</p>
              <p className="text-xs font-mono text-[var(--text-secondary)]">{approveModal.sender.email}</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
              Before approving, make sure this address is verified in your Brevo dashboard.
            </div>
            <Toggle
              label="I've confirmed this sender is verified in Brevo"
              checked={approveModal.confirmed}
              onChange={(v) => setApproveModal((s) => ({ ...s, confirmed: v }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setApproveModal((s) => ({ ...s, open: false }))}>
                Cancel
              </Button>
              <Button variant="success" onClick={submitApprove} loading={approveModal.loading} disabled={!approveModal.confirmed}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject platform sender */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal((s) => ({ ...s, open: false }))} title="Reject platform sender" size="md">
        {rejectModal.sender && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <p className="font-medium text-[var(--text-primary)]">{rejectModal.sender.name}</p>
              <p className="text-xs font-mono text-[var(--text-secondary)]">{rejectModal.sender.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Reason for rejection (required)
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value }))}
                rows={3}
                placeholder="e.g. Not verified in Brevo"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejectModal((s) => ({ ...s, open: false }))}>
                Cancel
              </Button>
              <Button variant="danger" onClick={submitReject} loading={rejectModal.loading} disabled={!rejectModal.reason.trim()}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete platform sender */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal((s) => ({ ...s, open: false }))} title="Delete sender" size="md">
        {deleteModal.sender && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Delete <strong className="text-[var(--text-primary)]">{deleteModal.sender.name}</strong> ·{' '}
              <span className="font-mono text-xs">{deleteModal.sender.email}</span>?
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Customers using this address as their "from" will start getting delivery failures. Consider deactivating instead.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteModal((s) => ({ ...s, open: false }))}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={submitDeactivateInstead} loading={deleteModal.loading}>
                Deactivate instead
              </Button>
              <Button variant="danger" onClick={submitDelete} loading={deleteModal.loading}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve customer submission */}
      <Modal
        open={clientApproveModal.open}
        onClose={() => setClientApproveModal({ open: false, sender: null, loading: false })}
        title="Approve customer sender"
        size="md"
      >
        {clientApproveModal.sender && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <p className="font-medium text-[var(--text-primary)]">{clientApproveModal.sender.name}</p>
              <p className="text-xs font-mono text-[var(--text-secondary)] break-all">{clientApproveModal.sender.email}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {clientApproveModal.sender.organizationId?.name || '—'}
                {clientApproveModal.sender.userId?.name
                  ? ` · ${clientApproveModal.sender.userId.name}`
                  : clientApproveModal.sender.userId?.email
                    ? ` · ${clientApproveModal.sender.userId.email}`
                    : ''}
              </p>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Approving enables this address for the customer immediately. It will <strong>not</strong> be shared with other organizations.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setClientApproveModal({ open: false, sender: null, loading: false })}>
                Cancel
              </Button>
              <Button variant="success" onClick={submitClientApprove} loading={clientApproveModal.loading}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject customer submission */}
      <Modal
        open={clientRejectModal.open}
        onClose={() => setClientRejectModal({ open: false, sender: null, reason: '', loading: false })}
        title="Reject customer sender"
        size="md"
      >
        {clientRejectModal.sender && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-sm">
              <p className="font-medium text-[var(--text-primary)]">{clientRejectModal.sender.name}</p>
              <p className="text-xs font-mono text-[var(--text-secondary)] break-all">{clientRejectModal.sender.email}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {clientRejectModal.sender.organizationId?.name || '—'}
                {clientRejectModal.sender.userId?.name
                  ? ` · ${clientRejectModal.sender.userId.name}`
                  : clientRejectModal.sender.userId?.email
                    ? ` · ${clientRejectModal.sender.userId.email}`
                    : ''}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Reason for rejection (required)
              </label>
              <textarea
                value={clientRejectModal.reason}
                onChange={(e) => setClientRejectModal((s) => ({ ...s, reason: e.target.value }))}
                rows={3}
                placeholder="e.g. Please verify the sending domain in your Brevo account first"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                The customer will see this reason in their dashboard.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setClientRejectModal({ open: false, sender: null, reason: '', loading: false })}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={submitClientReject}
                loading={clientRejectModal.loading}
                disabled={!clientRejectModal.reason.trim()}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}