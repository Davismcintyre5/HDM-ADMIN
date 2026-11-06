// src/pages/talanta/Categories.jsx
import { useEffect, useState, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Table from '../../components/talanta/ui/Table';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Input from '../../components/talanta/ui/Input';
import Select from '../../components/talanta/ui/Select';
import Toggle from '../../components/talanta/ui/Toggle';
import Modal from '../../components/talanta/ui/Modal';
import ConfirmDialog from '../../components/talanta/ui/ConfirmDialog';
import Spinner from '../../components/talanta/ui/Spinner';
import { useToast } from '../../context/talanta/ToastContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/talanta/categories';
import { TIERS, formatTier } from '../../utils/talanta/constants';
import { formatMoneyMajor } from '../../utils/talanta/formatMoney';

const EMPTY = {
  name: '',
  section: '',
  price: 0,
  currency: 'KES',
  tier: 'regular',
  order: 0,
  isActive: true,
};

export default function Categories() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [modal, setModal] = useState({ open: false, mode: 'create', category: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, category: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getCategories();
      setItems(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY, order: items.length + 1 });
    setModal({ open: true, mode: 'create', category: null });
  };

  const openEdit = (c) => {
    setForm({
      name: c.name || '',
      section: c.section || '',
      price: c.price ?? 0,
      currency: c.currency || 'KES',
      tier: c.tier || 'regular',
      order: c.order ?? 0,
      isActive: c.isActive !== false,
    });
    setModal({ open: true, mode: 'edit', category: c });
  };

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), order: Number(form.order) };
      if (modal.mode === 'create') await createCategory(payload);
      else await updateCategory(modal.category._id || modal.category.id, payload);
      toast.success(modal.mode === 'create' ? 'Category created' : 'Category updated');
      setModal({ open: false, mode: 'create', category: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete.category) return;
    setBusy(true);
    try {
      await deleteCategory(confirmDelete.category._id || confirmDelete.category.id);
      toast.success('Category deleted');
      setConfirmDelete({ open: false, category: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.name}</span>
      ),
    },
    {
      key: 'section',
      label: 'Section',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.section || '—'}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatMoneyMajor(row.price, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (row) => (
        <Badge
          variant={
            row.tier === 'premium' ? 'warning' : row.tier === 'mid' ? 'info' : 'default'
          }
        >
          {formatTier(row.tier)}
        </Badge>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      render: (row) => <span className="text-sm">{row.order ?? '—'}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) =>
        row.isActive !== false ? (
          <Badge variant="success" dot>Active</Badge>
        ) : (
          <Badge variant="default" dot>Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
            <HiPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirmDelete({ open: true, category: row })}
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {items.length} seat categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
            Refresh
          </Button>
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
            New category
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            emptyMessage="No categories yet"
          />
        </div>
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', category: null })}
        title={modal.mode === 'create' ? 'New category' : 'Edit category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', category: null })}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => patch('name', e.target.value)} />
          <Input label="Section" value={form.section} onChange={(e) => patch('section', e.target.value)} placeholder="e.g. VIP Stand" />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => patch('price', e.target.value)}
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(e) => patch('currency', e.target.value)}
              options={['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX'].map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Tier"
              value={form.tier}
              onChange={(e) => patch('tier', e.target.value)}
              options={TIERS.map((t) => ({ value: t, label: formatTier(t) }))}
            />
          </div>
          <Input
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => patch('order', e.target.value)}
          />
          <Toggle label="Active" checked={form.isActive} onChange={(v) => patch('isActive', v)} />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, category: null })}
        onConfirm={doDelete}
        title="Delete category"
        message={`Delete "${confirmDelete.category?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
      />
    </div>
  );
}