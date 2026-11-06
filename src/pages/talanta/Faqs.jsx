// src/pages/talanta/Faqs.jsx
import { useEffect, useState, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiRefresh } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Table from '../../components/talanta/ui/Table';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Input from '../../components/talanta/ui/Input';
import Textarea from '../../components/talanta/ui/Textarea';
import Toggle from '../../components/talanta/ui/Toggle';
import Modal from '../../components/talanta/ui/Modal';
import ConfirmDialog from '../../components/talanta/ui/ConfirmDialog';
import { useToast } from '../../context/talanta/ToastContext';
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../../services/talanta/faqs';

const EMPTY = { question: '', answer: '', order: 0, isPublic: true };

export default function Faqs() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [modal, setModal] = useState({ open: false, mode: 'create', faq: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, faq: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getFaqs();
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
    setModal({ open: true, mode: 'create', faq: null });
  };

  const openEdit = (f) => {
    setForm({
      question: f.question || '',
      answer: f.answer || '',
      order: f.order ?? 0,
      isPublic: f.isPublic !== false,
    });
    setModal({ open: true, mode: 'edit', faq: f });
  };

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (modal.mode === 'create') await createFaq(payload);
      else await updateFaq(modal.faq._id || modal.faq.id, payload);
      toast.success('FAQ saved');
      setModal({ open: false, mode: 'create', faq: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete.faq) return;
    setBusy(true);
    try {
      await deleteFaq(confirmDelete.faq._id || confirmDelete.faq.id);
      toast.success('FAQ deleted');
      setConfirmDelete({ open: false, faq: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'question',
      label: 'Question',
      render: (row) => (
        <span className="font-medium text-[var(--text-primary)] truncate max-w-md block">
          {row.question}
        </span>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      render: (row) => <span className="text-sm">{row.order ?? '—'}</span>,
    },
    {
      key: 'isPublic',
      label: 'Visibility',
      render: (row) =>
        row.isPublic !== false ? (
          <Badge variant="success" dot>Public</Badge>
        ) : (
          <Badge variant="default">Hidden</Badge>
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
            onClick={() => setConfirmDelete({ open: true, faq: row })}
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">FAQs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {items.length} questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={load} loading={loading}>
            Refresh
          </Button>
          <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
            New FAQ
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
            emptyMessage="No FAQs yet"
          />
        </div>
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', faq: null })}
        title={modal.mode === 'create' ? 'New FAQ' : 'Edit FAQ'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal({ open: false, mode: 'create', faq: null })}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Question *" value={form.question} onChange={(e) => patch('question', e.target.value)} />
          <Textarea
            label="Answer *"
            rows={5}
            value={form.answer}
            onChange={(e) => patch('answer', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Order"
              type="number"
              value={form.order}
              onChange={(e) => patch('order', e.target.value)}
            />
            <div className="flex items-end pb-1">
              <Toggle
                label="Public"
                checked={form.isPublic}
                onChange={(v) => patch('isPublic', v)}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, faq: null })}
        onConfirm={doDelete}
        title="Delete FAQ"
        message={`Delete "${confirmDelete.faq?.question}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
      />
    </div>
  );
}