import { useEffect, useState } from 'react';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../../services/portfolio/services';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import Input from '../../components/portfolio/ui/Input';
import Toggle from '../../components/portfolio/ui/Toggle';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import { useToast } from '../../context/portfolio/ToastContext';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi';

const EMPTY_FORM = {
  title: '',
  description: '',
  icon: '⚡',
  isActive: true,
  order: 0,
};

export default function Services() {
  const toast = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, service: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const fetchServices = () => {
    setLoading(true);
    getServices()
      .then((res) => {
        const list = res.data || res || [];
        setServices(
          Array.isArray(list)
            ? [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            : []
        );
      })
      .catch((err) => toast.error(err.message || 'Failed to load services'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, service: null });
  };

  const openEdit = (s) => {
    setForm({ ...EMPTY_FORM, ...s });
    setModal({ open: true, service: s });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      if (modal.service) await updateService(modal.service._id, form);
      else await createService(form);
      toast.success(modal.service ? 'Service updated' : 'Service created');
      setModal({ open: false, service: null });
      fetchServices();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteService(confirmDelete.id);
      toast.success('Service deleted');
      setConfirmDelete({ open: false, id: null });
      fetchServices();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)]">
          {row.title}
        </span>
      ),
    },
    {
      key: 'icon',
      label: 'Icon',
      render: (row) => <span className="text-lg">{row.icon || '⚡'}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) =>
        row.isActive !== false ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="default">Inactive</Badge>
        ),
    },
    {
      key: 'order',
      label: 'Order',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">{row.order}</span>
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
            onClick={() => setConfirmDelete({ open: true, id: row._id })}
          >
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Services
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
          Add Service
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4">
          <Table
            columns={columns}
            data={services}
            loading={loading}
            emptyMessage="No services yet."
          />
        </div>
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, service: null })}
        title={modal.service ? 'Edit Service' : 'New Service'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="Icon (emoji)"
            value={form.icon}
            onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
            placeholder="⚡"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-green-500 resize-y text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Toggle
              label="Active"
              checked={form.isActive !== false}
              onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            />
            <Input
              label="Order"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((p) => ({ ...p, order: Number(e.target.value) }))
              }
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setModal({ open: false, service: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        title="Delete Service"
        message="Permanently delete this service?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}