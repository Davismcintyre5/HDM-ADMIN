import { useEffect, useState, useCallback, useRef } from 'react';
import {
  HiPlus,
  HiRefresh,
  HiTrash,
  HiPencil,
  HiEye,
  HiCheckCircle,
  HiMinusCircle,
  HiMail,
  HiDeviceMobile,
  HiPrinter,
  HiDocumentDownload,
} from 'react-icons/hi';
import Card from '../../../components/portfolio/ui/Card';
import Table from '../../../components/portfolio/ui/Table';
import Badge from '../../../components/portfolio/ui/Badge';
import Button from '../../../components/portfolio/ui/Button';
import Input from '../../../components/portfolio/ui/Input';
import Textarea from '../../../components/portfolio/ui/Textarea';
import Spinner from '../../../components/portfolio/ui/Spinner';
import ConfirmDialog from '../../../components/portfolio/ui/ConfirmDialog';
import { useToast } from '../../../context/portfolio/ToastContext';
import { useHdm } from '../../../context/portfolio/HdmContext';
import { exportElementToPdf, printElement } from '../../../utils/portfolio/pdfExport';
import {
  listCommunications,
  getCommunication,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  publishCommunication,
  unpublishCommunication,
  archiveCommunication,
  regenerateAdvert,
  uploadCommunicationImage,
  removeCommunicationImage,
  sendCommunicationEmail,
  sendCommunicationSms,
} from '../../../services/portfolio/communications';

const STATUS_VARIANT = {
  draft: 'default',
  published: 'success',
  archived: 'default',
};

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function CommunicationTabBase({
  type,
  label,
  icon = '📄',
  fields = [],
  advertKinds = null,
  titlePlaceholder = 'Title',
  bodyPlaceholder = 'Write the content...',
}) {
  const toast = useToast();
  const { company } = useHdm();

  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, drafts: 0, published: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [rowAction, setRowAction] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    subtitle: '',
    body: '',
    fields: {},
    advertKind: advertKinds ? advertKinds[0].value : null,
  });
  const [creating, setCreating] = useState(false);

  const [confirm, setConfirm] = useState({ open: false, action: null });
  const [sendPanel, setSendPanel] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [smsInput, setSmsInput] = useState('');
  const [sending, setSending] = useState(false);

  const printRef = useRef(null);

  /* ============================================================
     Load list
     ============================================================ */
  const loadList = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await listCommunications({
          type,
          status: statusFilter || undefined,
          search: search || undefined,
        });
        const data = res?.data || res;
        setItems(data.communications || []);
        if (data.stats) setStats(data.stats);
      } catch (err) {
        if (!silent) toast.error(err.message || 'Failed to load');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [type, statusFilter, search, toast]
  );

  useEffect(() => {
    if (view === 'list') loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, statusFilter]);

  useEffect(() => {
    if (view !== 'list') return;
    const t = setTimeout(() => loadList(true), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* ============================================================
     Load detail
     ============================================================ */
  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await getCommunication(id);
      const d = res?.data || res;
      setDetail(d);
      return d;
    } catch (err) {
      toast.error(err.message || 'Failed to load');
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = async (id) => {
    setView('edit');
    setDetail(null);
    await loadDetail(id);
  };

  const openView = async (id) => {
    setView('view');
    setDetail(null);
    await loadDetail(id);
  };

  const backToList = () => {
    setView('list');
    setDetail(null);
    setCreateForm({
      title: '',
      subtitle: '',
      body: '',
      fields: {},
      advertKind: advertKinds ? advertKinds[0].value : null,
    });
    loadList();
  };

  /* ============================================================
     Create
     ============================================================ */
  const handleCreate = async () => {
    if (!createForm.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    setCreating(true);
    try {
      const res = await createCommunication({
        type,
        title: createForm.title.trim(),
        subtitle: createForm.subtitle,
        body: createForm.body,
        fields: createForm.fields,
        advertKind: createForm.advertKind || null,
      });
      const created = res?.data || res;
      toast.success('Created as draft');
      if (created?._id) {
        setView('edit');
        setDetail(created);
        setCreateForm({
          title: '',
          subtitle: '',
          body: '',
          fields: {},
          advertKind: advertKinds ? advertKinds[0].value : null,
        });
      } else {
        backToList();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  /* ============================================================
     Save
     ============================================================ */
  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const res = await updateCommunication(detail._id, {
        title: detail.title,
        subtitle: detail.subtitle,
        body: detail.body,
        fields: detail.fields,
        advertKind: detail.advertKind,
        isPublic: detail.isPublic,
      });
      setDetail(res?.data || res);
      toast.success('Saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     Status actions
     ============================================================ */
  const runStatus = async (action) => {
    setStatusLoading(action);
    try {
      const fn =
        action === 'publish'
          ? publishCommunication
          : action === 'unpublish'
          ? unpublishCommunication
          : action === 'archive'
          ? archiveCommunication
          : action === 'regenerate'
          ? regenerateAdvert
          : null;
      if (!fn) return;
      const res = await fn(detail._id);
      setDetail(res?.data || res);
      toast.success(`${action} successful`);
      setConfirm({ open: false, action: null });
    } catch (err) {
      toast.error(err.message || `${action} failed`);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleRowPublish = async (row, action) => {
    setRowAction(`${action}-${row._id}`);
    try {
      const fn = action === 'publish' ? publishCommunication : unpublishCommunication;
      await fn(row._id);
      toast.success(`${action} successful`);
      loadList(true);
    } catch (err) {
      toast.error(err.message || `${action} failed`);
    } finally {
      setRowAction(null);
    }
  };

  const handleRowDelete = async (row) => {
    setRowAction(`delete-${row._id}`);
    try {
      await deleteCommunication(row._id);
      toast.success('Deleted');
      loadList(true);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setRowAction(null);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    try {
      await deleteCommunication(detail._id);
      toast.success('Deleted');
      setConfirm({ open: false, action: null });
      backToList();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  /* ============================================================
     Images
     ============================================================ */
  const handleImageUpload = async (file) => {
    if (!file || !detail) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadCommunicationImage(detail._id, fd);
      setDetail(res?.data || res);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = async (publicId) => {
    if (!detail) return;
    try {
      const res = await removeCommunicationImage(detail._id, publicId);
      setDetail(res?.data || res);
      toast.success('Image removed');
    } catch (err) {
      toast.error(err.message || 'Remove failed');
    }
  };

  /* ============================================================
     Send
     ============================================================ */
  const handleSendEmail = async () => {
    const list = emailInput.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (!list.length) return toast.error('Enter at least one email');
    setSending(true);
    try {
      const res = await sendCommunicationEmail(detail._id, { recipients: list });
      toast.success(res?.data?.message || res?.message || 'Email sent');
      setEmailInput('');
      setSendPanel(null);
    } catch (err) {
      toast.error(err.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const handleSendSms = async () => {
    const list = smsInput.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (!list.length) return toast.error('Enter at least one phone number');
    setSending(true);
    try {
      const res = await sendCommunicationSms(detail._id, { recipients: list });
      toast.success(res?.data?.message || res?.message || 'SMS sent');
      setSmsInput('');
      setSendPanel(null);
    } catch (err) {
      toast.error(err.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  /* ============================================================
     Print / PDF
     ============================================================ */
  const handlePrint = async () => {
    const el = printRef.current;
    if (!el) {
      toast.error('Preview not ready, wait a moment');
      return;
    }
    try {
      await printElement(el);
    } catch (err) {
      console.error('print error', err);
      toast.error(err.message || 'Print failed');
    }
  };

  const handleExportPdf = async () => {
    const el = printRef.current;
    if (!el) {
      toast.error('Preview not ready, wait a moment');
      return;
    }
    setPdfLoading(true);
    try {
      const safeName = (detail?.title || label).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
      await exportElementToPdf(el, `${safeName}.pdf`);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error('pdf error', err);
      toast.error(err.message || 'PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadList(true);
    } finally {
      setRefreshing(false);
    }
  };

  /* ============================================================
     RENDER — LIST
     ============================================================ */
  if (view === 'list') {
    const columns = [
      {
        key: 'title',
        label: 'Title',
        render: (row) => (
          <div>
            <p className="font-medium text-sm text-[var(--text-primary)]">{row.title}</p>
            {row.subtitle && (
              <p className="text-xs text-[var(--text-muted)] truncate max-w-xs">{row.subtitle}</p>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <Badge variant={STATUS_VARIANT[row.status] || 'default'} dot>
            {row.status}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (row) => (
          <span className="text-xs text-[var(--text-muted)]">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        align: 'right',
        render: (row) => {
          const busy = rowAction?.endsWith(row._id);
          const isPublishing = rowAction === `publish-${row._id}`;
          const isUnpublishing = rowAction === `unpublish-${row._id}`;
          const isDeleting = rowAction === `delete-${row._id}`;

          return (
            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => openView(row._id)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                title="View"
                disabled={busy}
              >
                <HiEye className="w-4 h-4" />
              </button>

              <button
                onClick={() => openEdit(row._id)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                title="Edit"
                disabled={busy}
              >
                <HiPencil className="w-4 h-4" />
              </button>

              {row.status === 'draft' && (
                <button
                  onClick={() => handleRowPublish(row, 'publish')}
                  className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 disabled:opacity-50"
                  title="Publish"
                  disabled={busy}
                >
                  {isPublishing ? <Spinner size="sm" /> : <HiCheckCircle className="w-4 h-4" />}
                </button>
              )}

              {row.status === 'published' && (
                <button
                  onClick={() => handleRowPublish(row, 'unpublish')}
                  className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 disabled:opacity-50"
                  title="Unpublish"
                  disabled={busy}
                >
                  {isUnpublishing ? <Spinner size="sm" /> : <HiMinusCircle className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={() => {
                  if (window.confirm(`Delete "${row.title}"?`)) handleRowDelete(row);
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50"
                title="Delete"
                disabled={busy}
              >
                {isDeleting ? <Spinner size="sm" /> : <HiTrash className="w-4 h-4" />}
              </button>
            </div>
          );
        },
      },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Drafts" value={stats.drafts} />
          <StatCard label="Published" value={stats.published} />
          <StatCard label="Archived" value={stats.archived} />
        </div>

        <Card padding={false}>
          <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none"
            />
            <div className="flex gap-1 overflow-x-auto">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    statusFilter === f.value
                      ? 'bg-green-600 text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {loading && !items.length ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !items.length ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-4xl">{icon}</span>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {search || statusFilter
                    ? `No matching ${label.toLowerCase()}s`
                    : `No ${label.toLowerCase()}s yet`}
                </p>
                {!search && !statusFilter && (
                  <Button
                    icon={<HiPlus className="w-4 h-4" />}
                    onClick={() => setView('create')}
                    size="sm"
                  >
                    Create First
                  </Button>
                )}
              </div>
            ) : (
              <Table
                columns={columns}
                data={items}
                rowKey={(r) => r._id}
                onRowClick={(r) => openView(r._id)}
              />
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            icon={<HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setView('create')}>
            New {label}
          </Button>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER — CREATE
     ============================================================ */
  if (view === 'create') {
    const isBundleAdvert =
      advertKinds &&
      (createForm.advertKind === 'services' || createForm.advertKind === 'products');

    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={backToList}>
            ← Back
          </Button>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">New {label}</h2>
        </div>

        <Card title="Content">
          <div className="space-y-3">
            <Input
              label="Title *"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder={titlePlaceholder}
            />
            <Input
              label="Subtitle"
              value={createForm.subtitle}
              onChange={(e) => setCreateForm({ ...createForm, subtitle: e.target.value })}
              placeholder="Optional subtitle"
            />

            {fields.map((f) =>
              f.type === 'textarea' ? (
                <Textarea
                  key={f.name}
                  label={f.label}
                  rows={f.rows || 3}
                  value={createForm.fields?.[f.name] || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      fields: { ...createForm.fields, [f.name]: e.target.value },
                    })
                  }
                  placeholder={f.placeholder || ''}
                />
              ) : (
                <Input
                  key={f.name}
                  label={f.label}
                  type={f.type || 'text'}
                  value={createForm.fields?.[f.name] || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      fields: { ...createForm.fields, [f.name]: e.target.value },
                    })
                  }
                  placeholder={f.placeholder || ''}
                />
              )
            )}

            {advertKinds && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Advert Kind
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {advertKinds.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, advertKind: o.value })}
                      className={`p-2 rounded-lg border text-xs font-medium transition text-left ${
                        createForm.advertKind === o.value
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      <div className="text-[var(--text-primary)]">{o.label}</div>
                      {o.desc && (
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{o.desc}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isBundleAdvert ? (
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-sm">
                <p className="font-medium text-[var(--text-primary)] mb-1">Body auto-generated</p>
                <p className="text-xs text-[var(--text-muted)]">
                  At save time, the body will be built from your active {createForm.advertKind} list.
                </p>
              </div>
            ) : (
              <Textarea
                label="Body"
                rows={8}
                value={createForm.body}
                onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })}
                placeholder={bodyPlaceholder}
              />
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={backToList} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={creating}>
            Create Draft
          </Button>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER — EDIT
     ============================================================ */
  if (view === 'edit') {
    if (detailLoading || !detail) {
      return (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      );
    }

    const isBundleAdvert =
      advertKinds &&
      (detail.advertKind === 'services' || detail.advertKind === 'products');

    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={backToList}>
            ← Back
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">
              Edit {label}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{detail.title}</p>
          </div>
          <Button
            variant="secondary"
            icon={<HiEye className="w-4 h-4" />}
            onClick={() => openView(detail._id)}
          >
            View
          </Button>
        </div>

        <Card title="Content">
          <div className="space-y-3">
            <Input
              label="Title"
              value={detail.title || ''}
              onChange={(e) => setDetail({ ...detail, title: e.target.value })}
            />
            <Input
              label="Subtitle"
              value={detail.subtitle || ''}
              onChange={(e) => setDetail({ ...detail, subtitle: e.target.value })}
            />

            {fields.map((f) =>
              f.type === 'textarea' ? (
                <Textarea
                  key={f.name}
                  label={f.label}
                  rows={f.rows || 3}
                  value={detail.fields?.[f.name] || ''}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      fields: { ...detail.fields, [f.name]: e.target.value },
                    })
                  }
                />
              ) : (
                <Input
                  key={f.name}
                  label={f.label}
                  type={f.type || 'text'}
                  value={detail.fields?.[f.name] || ''}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      fields: { ...detail.fields, [f.name]: e.target.value },
                    })
                  }
                />
              )
            )}

            {isBundleAdvert ? (
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium text-[var(--text-primary)]">
                  Body — auto-generated from {detail.advertKind}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {detail.body?.length ? `${detail.body.length} characters` : 'Empty'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirm({ open: true, action: 'regenerate' })}
                >
                  ↻ Regenerate
                </Button>
              </div>
            ) : (
              <Textarea
                label="Body"
                rows={10}
                value={detail.body || ''}
                onChange={(e) => setDetail({ ...detail, body: e.target.value })}
              />
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Images">
          <div className="space-y-3">
            {(detail.images || []).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {detail.images.map((img) => (
                  <div key={img.publicId} className="relative group">
                    <img
                      src={img.url}
                      alt={img.caption || ''}
                      className="w-full h-32 object-cover rounded-lg border border-[var(--border-color)]"
                    />
                    <button
                      onClick={() => handleImageRemove(img.publicId)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No images yet.</p>
            )}
            <label className="inline-block cursor-pointer px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-sm">
              {uploading ? 'Uploading...' : '+ Add Image'}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>
        </Card>

        <Card title="Status">
          <div className="flex flex-wrap gap-2">
            {detail.status === 'draft' && (
              <Button
                variant="success"
                onClick={() => setConfirm({ open: true, action: 'publish' })}
                loading={statusLoading === 'publish'}
              >
                Publish
              </Button>
            )}
            {detail.status === 'published' && (
              <Button
                variant="warning"
                onClick={() => setConfirm({ open: true, action: 'unpublish' })}
                loading={statusLoading === 'unpublish'}
              >
                Unpublish
              </Button>
            )}
            {detail.status !== 'archived' && (
              <Button
                variant="secondary"
                onClick={() => setConfirm({ open: true, action: 'archive' })}
                loading={statusLoading === 'archive'}
              >
                Archive
              </Button>
            )}
            <Button
              variant="danger"
              icon={<HiTrash className="w-4 h-4" />}
              onClick={() => setConfirm({ open: true, action: 'delete' })}
              className="ml-auto"
            >
              Delete
            </Button>
          </div>
        </Card>

        <ConfirmDialog
          open={confirm.open}
          onClose={() => setConfirm({ open: false, action: null })}
          onConfirm={() => {
            if (confirm.action === 'delete') handleDelete();
            else runStatus(confirm.action);
          }}
          title={
            confirm.action === 'delete'
              ? 'Delete'
              : confirm.action === 'publish'
              ? 'Publish'
              : confirm.action === 'unpublish'
              ? 'Unpublish'
              : confirm.action === 'archive'
              ? 'Archive'
              : confirm.action === 'regenerate'
              ? 'Regenerate Body'
              : 'Confirm'
          }
          message={
            confirm.action === 'delete'
              ? `Permanently delete "${detail.title}"?`
              : confirm.action === 'publish'
              ? `Publish "${detail.title}"?`
              : confirm.action === 'unpublish'
              ? `Move back to draft?`
              : confirm.action === 'archive'
              ? `Archive "${detail.title}"?`
              : confirm.action === 'regenerate'
              ? `Regenerate body from current ${detail.advertKind} list?`
              : ''
          }
          confirmLabel="Confirm"
          variant={confirm.action === 'delete' ? 'danger' : 'primary'}
          loading={confirm.action === 'delete' ? false : statusLoading === confirm.action}
        />
      </div>
    );
  }

  /* ============================================================
     RENDER — VIEW
     ============================================================ */
  if (view === 'view') {
    if (detailLoading || !detail) {
      return (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" onClick={backToList}>
            ← Back
          </Button>
          <div className="flex-1" />
          <Button
            variant="secondary"
            icon={<HiPencil className="w-4 h-4" />}
            onClick={() => openEdit(detail._id)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={handlePrint}
            icon={<HiPrinter className="w-4 h-4" />}
          >
            Print
          </Button>
          <Button
            onClick={handleExportPdf}
            loading={pdfLoading}
            icon={<HiDocumentDownload className="w-4 h-4" />}
          >
            PDF
          </Button>
        </div>

        <Card title="Meta">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Badge variant={STATUS_VARIANT[detail.status] || 'default'} dot>
              {detail.status}
            </Badge>
            {detail.advertKind && (
              <>
                <span>·</span>
                <span className="capitalize">{detail.advertKind}</span>
              </>
            )}
            <span>·</span>
            <span>Created {new Date(detail.createdAt).toLocaleString()}</span>
            {detail.publishedAt && (
              <>
                <span>·</span>
                <span>Published {new Date(detail.publishedAt).toLocaleString()}</span>
              </>
            )}
          </div>
        </Card>

        <Card title="Preview" padding={false}>
          <div className="p-4 bg-[var(--bg-tertiary)] overflow-auto">
            <div
              className="mx-auto bg-white shadow-md rounded"
              style={{ width: '794px', maxWidth: '100%' }}
            >
              <CommunicationDocument
                detail={detail}
                company={company}
                label={label}
                type={type}
              />
            </div>
          </div>
        </Card>

        <Card title="Send">
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={sendPanel === 'email' ? 'primary' : 'secondary'}
                icon={<HiMail className="w-4 h-4" />}
                onClick={() => setSendPanel(sendPanel === 'email' ? null : 'email')}
              >
                Email
              </Button>
              <Button
                variant={sendPanel === 'sms' ? 'primary' : 'secondary'}
                icon={<HiDeviceMobile className="w-4 h-4" />}
                onClick={() => setSendPanel(sendPanel === 'sms' ? null : 'sms')}
              >
                SMS
              </Button>
            </div>

            {sendPanel === 'email' && (
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 space-y-2">
                <Textarea
                  label="Recipients (comma or newline separated)"
                  rows={3}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="john@example.com, jane@example.com"
                />
                <Button size="sm" onClick={handleSendEmail} loading={sending}>
                  Send Email
                </Button>
              </div>
            )}

            {sendPanel === 'sms' && (
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 space-y-2">
                <Textarea
                  label="Phone numbers (comma or newline separated)"
                  rows={3}
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  placeholder="254712345678, 254787654321"
                />
                <Button size="sm" onClick={handleSendSms} loading={sending}>
                  Send SMS
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Status">
          <div className="flex flex-wrap gap-2">
            {detail.status === 'draft' && (
              <Button
                variant="success"
                onClick={() => setConfirm({ open: true, action: 'publish' })}
                loading={statusLoading === 'publish'}
              >
                Publish
              </Button>
            )}
            {detail.status === 'published' && (
              <Button
                variant="warning"
                onClick={() => setConfirm({ open: true, action: 'unpublish' })}
                loading={statusLoading === 'unpublish'}
              >
                Unpublish
              </Button>
            )}
            {detail.status !== 'archived' && (
              <Button
                variant="secondary"
                onClick={() => setConfirm({ open: true, action: 'archive' })}
                loading={statusLoading === 'archive'}
              >
                Archive
              </Button>
            )}
            <Button
              variant="danger"
              icon={<HiTrash className="w-4 h-4" />}
              onClick={() => setConfirm({ open: true, action: 'delete' })}
              className="ml-auto"
            >
              Delete
            </Button>
          </div>
        </Card>

        <ConfirmDialog
          open={confirm.open}
          onClose={() => setConfirm({ open: false, action: null })}
          onConfirm={() => {
            if (confirm.action === 'delete') handleDelete();
            else runStatus(confirm.action);
          }}
          title={
            confirm.action === 'delete'
              ? 'Delete'
              : confirm.action === 'publish'
              ? 'Publish'
              : confirm.action === 'unpublish'
              ? 'Unpublish'
              : confirm.action === 'archive'
              ? 'Archive'
              : 'Confirm'
          }
          message={
            confirm.action === 'delete'
              ? `Permanently delete "${detail.title}"?`
              : confirm.action === 'publish'
              ? `Publish "${detail.title}"?`
              : confirm.action === 'unpublish'
              ? `Move back to draft?`
              : confirm.action === 'archive'
              ? `Archive "${detail.title}"?`
              : ''
          }
          confirmLabel="Confirm"
          variant={confirm.action === 'delete' ? 'danger' : 'primary'}
          loading={confirm.action === 'delete' ? false : statusLoading === confirm.action}
        />

        {/* Hidden print/pdf render target */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '794px',
            opacity: 0.001,
            zIndex: -1,
            pointerEvents: 'none',
            overflow: 'visible',
            background: '#ffffff',
          }}
        >
          <div ref={printRef}>
            <CommunicationDocument
              detail={detail}
              company={company}
              label={label}
              type={type}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ============================================================
   PRINTABLE DOCUMENT LAYOUT (type-aware)
   ============================================================ */
function CommunicationDocument({ detail, company, label, type }) {
  const c = company || {};

  const showStamp = !!c.stampUrl;

  const todayStr = (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  const docDateStr = (() => {
    const d = new Date(detail.createdAt || Date.now());
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  const letterhead = (
    <div
      style={{
        borderBottom: '2px solid #0a1628',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1.5rem',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0a1628',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          {c.name || 'HDM TECHNOLOGIES'}
        </h1>
        {c.tagline && (
          <p
            style={{
              fontSize: '0.8rem',
              fontStyle: 'italic',
              color: '#4b5563',
              margin: '0.25rem 0',
            }}
          >
            {c.tagline}
          </p>
        )}
        <p style={{ fontSize: '0.72rem', color: '#374151', margin: 0 }}>
          {[c.poBox, c.city, c.country].filter(Boolean).join(' · ')}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#1e6ef0', margin: '0.15rem 0 0' }}>
          {[c.email, c.website, c.phone].filter(Boolean).join('  ·  ')}
        </p>
      </div>
      {c.logo && (
        <img
          src={c.logo}
          alt="logo"
          style={{ maxHeight: '60px', maxWidth: '120px', objectFit: 'contain' }}
        />
      )}
    </div>
  );

  const watermark = c.logo ? (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.06,
        pointerEvents: 'none',
        zIndex: 0,
        width: '55%',
        maxWidth: '420px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src={c.logo}
        alt=""
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    </div>
  ) : null;

  const stampBlock = showStamp ? (
    <div style={{ textAlign: 'right', minWidth: '180px' }}>
      <img
        src={c.stampUrl}
        alt="stamp"
        style={{
          width: '90px',
          height: '90px',
          objectFit: 'contain',
          display: 'block',
          marginLeft: 'auto',
        }}
      />
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#1e6ef0',
          marginTop: '0.5rem',
          letterSpacing: '0.05em',
        }}
      >
        {todayStr}
      </div>
      <div
        style={{
          borderTop: '1px solid #000',
          width: '120px',
          marginTop: '0.25rem',
          marginLeft: 'auto',
        }}
      />
      <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem' }}>
        Official Stamp
      </div>
    </div>
  ) : null;

  const footer = (
    <div
      style={{
        marginTop: '2rem',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '0.75rem',
        fontSize: '0.72rem',
        color: '#6b7280',
        textAlign: 'center',
      }}
    >
      <div>
        © {new Date().getFullYear()} {c.name || 'HDM Technologies'}. All rights reserved.
      </div>
      <div>{[c.email, c.phone, c.website].filter(Boolean).join('  ·  ')}</div>
    </div>
  );

  const pageStyle = {
    position: 'relative',
    fontFamily: "'Times New Roman', Georgia, serif",
    background: '#fff',
    padding: '2rem 2.5rem',
    minHeight: '1123px',
    color: '#111',
    overflow: 'hidden',
  };

  const contentStyle = { position: 'relative', zIndex: 1 };

  /* ============================================================
     OFFICIAL LETTER
     ============================================================ */
  if (type === 'official-letter') {
    const f = detail.fields || {};

    return (
      <div style={pageStyle}>
        {watermark}
        <div style={contentStyle}>
          {letterhead}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#4b5563',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              {f.ourRef && <div>Our Ref: {f.ourRef}</div>}
              {f.yourRef && <div>Your Ref: {f.yourRef}</div>}
            </div>
            <div>{docDateStr}</div>
          </div>

          {(f.recipientName || f.recipientCompany || f.recipientAddress) && (
            <div
              style={{
                fontSize: '0.85rem',
                color: '#1f2937',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              {f.recipientName && <div style={{ fontWeight: 700 }}>{f.recipientName}</div>}
              {f.recipientCompany && <div>{f.recipientCompany}</div>}
              {f.recipientAddress && (
                <div style={{ whiteSpace: 'pre-wrap', color: '#4b5563' }}>
                  {f.recipientAddress}
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: '0.9rem', color: '#1f2937', margin: '0 0 1rem' }}>
            Dear Sir/Madam,
          </p>

          {f.subject && (
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0a1628',
                textDecoration: 'underline',
                margin: '0 0 1rem',
                textTransform: 'uppercase',
              }}
            >
              RE: {f.subject}
            </p>
          )}

          {detail.body && (
            <div
              style={{
                fontSize: '0.92rem',
                color: '#1f2937',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {detail.body}
            </div>
          )}

          <div style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: '#1f2937' }}>
            <p style={{ margin: '0 0 2.5rem' }}>Yours faithfully,</p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '2rem',
            }}
          >
            <div style={{ flex: 1 }}>
              {(f.signatoryName || f.signatoryTitle) && (
                <>
                  <div
                    style={{
                      borderTop: '1px solid #374151',
                      width: '180px',
                      margin: '0 0 0.35rem',
                    }}
                  />
                  {f.signatoryName && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a1628' }}>
                      {f.signatoryName}
                    </div>
                  )}
                  {f.signatoryTitle && (
                    <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                      {f.signatoryTitle}
                    </div>
                  )}
                </>
              )}
            </div>
            {stampBlock}
          </div>

          {f.enclosure && (
            <div
              style={{
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                fontStyle: 'italic',
                color: '#6b7280',
              }}
            >
              Enc: {f.enclosure}
            </div>
          )}

          {footer}
        </div>
      </div>
    );
  }

  /* ============================================================
     MEMO
     ============================================================ */
  if (type === 'memo') {
    const f = detail.fields || {};

    return (
      <div style={pageStyle}>
        {watermark}
        <div style={contentStyle}>
          {letterhead}

          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#0a1628',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              margin: '1rem 0 0.5rem',
            }}
          >
            Memorandum
          </h2>
          <div style={{ borderTop: '1px solid #cbd5e1', margin: '0 0 1.5rem' }} />

          <table
            style={{
              fontSize: '0.88rem',
              color: '#1f2937',
              marginBottom: '1.5rem',
              borderCollapse: 'collapse',
            }}
          >
            <tbody>
              {[
                ['To', f.to],
                ['From', f.from],
                ['CC', f.cc],
                ['Date', docDateStr],
                ['Subject', f.subject],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <tr key={k}>
                    <td
                      style={{
                        padding: '0.3rem 1rem 0.3rem 0',
                        fontWeight: 700,
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap',
                        color: '#0a1628',
                      }}
                    >
                      {k}:
                    </td>
                    <td style={{ padding: '0.3rem 0', color: '#1f2937' }}>{v}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px solid #cbd5e1', margin: '0 0 1.5rem' }} />

          {detail.title && (
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0a1628',
                margin: '0 0 1rem',
              }}
            >
              {detail.title}
            </h3>
          )}

          {detail.body && (
            <div
              style={{
                fontSize: '0.92rem',
                color: '#1f2937',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {detail.body}
            </div>
          )}

          <div
            style={{
              marginTop: '3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '2rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>Yours faithfully,</div>
              {(f.signatoryName || f.signatoryTitle) && (
                <div style={{ marginTop: '2rem' }}>
                  <div
                    style={{
                      borderTop: '1px solid #374151',
                      width: '180px',
                      margin: '0 0 0.35rem',
                    }}
                  />
                  {f.signatoryName && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a1628' }}>
                      {f.signatoryName}
                    </div>
                  )}
                  {f.signatoryTitle && (
                    <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                      {f.signatoryTitle}
                    </div>
                  )}
                </div>
              )}
            </div>
            {stampBlock}
          </div>

          {footer}
        </div>
      </div>
    );
  }

  /* ============================================================
     ANNOUNCEMENT
     ============================================================ */
  if (type === 'announcement') {
    const f = detail.fields || {};

    return (
      <div style={pageStyle}>
        {watermark}
        <div style={contentStyle}>
          {letterhead}

          <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#0a1628',
                color: '#fff',
                padding: '0.35rem 1.2rem',
                borderRadius: 4,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Announcement
            </div>
          </div>

          {detail.title && (
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#0a1628',
                textAlign: 'center',
                margin: '1rem 0 0.5rem',
              }}
            >
              {detail.title}
            </h2>
          )}
          {detail.subtitle && (
            <p
              style={{
                fontSize: '0.9rem',
                fontStyle: 'italic',
                color: '#4b5563',
                textAlign: 'center',
                margin: '0 0 1rem',
              }}
            >
              {detail.subtitle}
            </p>
          )}
          <p
            style={{
              fontSize: '0.7rem',
              color: '#1e6ef0',
              textAlign: 'center',
              letterSpacing: '0.1em',
              margin: '0 0 1.5rem',
            }}
          >
            {docDateStr.toUpperCase()}
          </p>
          <div style={{ borderTop: '1px solid #cbd5e1', margin: '0 0 1.5rem' }} />

          {detail.body && (
            <div
              style={{
                fontSize: '0.92rem',
                color: '#1f2937',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
              }}
            >
              {detail.body}
            </div>
          )}

          {(f.highlight1 || f.highlight2 || f.highlight3) && (
            <ul
              style={{
                marginTop: '1.5rem',
                paddingLeft: '1.25rem',
                fontSize: '0.88rem',
                color: '#1f2937',
              }}
            >
              {[f.highlight1, f.highlight2, f.highlight3]
                .filter(Boolean)
                .map((h, i) => (
                  <li key={i} style={{ marginBottom: '0.35rem' }}>
                    {h}
                  </li>
                ))}
            </ul>
          )}

          {f.ctaUrl && (
            <div
              style={{
                marginTop: '1.5rem',
                background: '#f3f4f6',
                borderRadius: 6,
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#4b5563',
              }}
            >
              Learn more at <strong style={{ color: '#1e6ef0' }}>{f.ctaUrl}</strong>
            </div>
          )}

          <div
            style={{
              marginTop: '3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '2rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>Sincerely,</div>
              {(f.signatoryName || f.signatoryTitle) && (
                <div style={{ marginTop: '2rem' }}>
                  <div
                    style={{
                      borderTop: '1px solid #374151',
                      width: '180px',
                      margin: '0 0 0.35rem',
                    }}
                  />
                  {f.signatoryName && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a1628' }}>
                      {f.signatoryName}
                    </div>
                  )}
                  {f.signatoryTitle && (
                    <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                      {f.signatoryTitle}
                    </div>
                  )}
                </div>
              )}
            </div>
            {stampBlock}
          </div>

          {footer}
        </div>
      </div>
    );
  }

  /* ============================================================
     ADVERT
     ============================================================ */
  if (type === 'advert') {
    const f = detail.fields || {};

    return (
      <div style={pageStyle}>
        {watermark}
        <div style={contentStyle}>
          {letterhead}

          {detail.title && (
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#0a1628',
                textAlign: 'center',
                margin: '1rem 0 0.5rem',
                letterSpacing: '0.02em',
              }}
            >
              {detail.title}
            </h2>
          )}
          {detail.subtitle && (
            <p
              style={{
                fontSize: '1rem',
                fontStyle: 'italic',
                color: '#4b5563',
                textAlign: 'center',
                margin: '0 0 1.5rem',
              }}
            >
              {detail.subtitle}
            </p>
          )}
          <div style={{ borderTop: '1px solid #cbd5e1', margin: '0 0 1.5rem' }} />

          {detail.body && (
            <div
              style={{ fontSize: '0.92rem', color: '#1f2937', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: detail.body }}
            />
          )}

          {detail.images?.length > 0 && (
            <div
              style={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
              }}
            >
              {detail.images.map((img) => (
                <img
                  key={img.publicId}
                  src={img.url}
                  alt={img.caption || ''}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              ))}
            </div>
          )}

          {(f.ctaUrl || f.contactEmail || f.contactPhone) && (
            <div
              style={{
                marginTop: '2rem',
                background: '#0a1628',
                color: '#fff',
                borderRadius: 8,
                padding: '1rem 1.5rem',
                textAlign: 'center',
              }}
            >
              {f.ctaUrl && (
                <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {f.ctaUrl}
                </div>
              )}
              {(f.contactEmail || f.contactPhone) && (
                <div style={{ fontSize: '0.78rem', color: '#93c5fd', marginTop: '0.5rem' }}>
                  {[f.contactEmail, f.contactPhone].filter(Boolean).join('  ·  ')}
                </div>
              )}
            </div>
          )}

          {footer}
        </div>
      </div>
    );
  }

  /* ============================================================
     FALLBACK
     ============================================================ */
  const fieldEntries = Object.entries(detail.fields || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );

  return (
    <div style={pageStyle}>
      {watermark}
      <div style={contentStyle}>
        {letterhead}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0a1628',
            textAlign: 'center',
            textTransform: 'uppercase',
            margin: '1.5rem 0 0.5rem',
          }}
        >
          {detail.title || label}
        </h2>
        <div style={{ borderTop: '1px solid #cbd5e1', margin: '0 0 1.5rem' }} />
        {fieldEntries.length > 0 && (
          <table
            style={{ fontSize: '0.85rem', marginBottom: '1.5rem', borderCollapse: 'collapse' }}
          >
            <tbody>
              {fieldEntries.map(([k, v]) => (
                <tr key={k}>
                  <td
                    style={{
                      padding: '0.35rem 1rem 0.35rem 0',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      color: '#0a1628',
                    }}
                  >
                    {k}:
                  </td>
                  <td style={{ padding: '0.35rem 0', whiteSpace: 'pre-wrap', color: '#1f2937' }}>
                    {String(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {detail.body && (
          <div style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{detail.body}</div>
        )}
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
          {stampBlock}
        </div>
        {footer}
      </div>
    </div>
  );
}

/* ============================================================
   StatCard
   ============================================================ */
function StatCard({ label, value }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
    </div>
  );
}