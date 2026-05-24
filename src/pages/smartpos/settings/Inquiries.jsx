import { useEffect, useState } from 'react';
import { getInquiries, resolveInquiry, deleteInquiry } from '../../../services/smartpos/inquiries';
import Table from '../../../components/smartpos/ui/Table';
import Badge from '../../../components/smartpos/ui/Badge';
import Button from '../../../components/smartpos/ui/Button';
import Modal from '../../../components/smartpos/ui/Modal';
import Spinner from '../../../components/smartpos/ui/Spinner';
import { formatDate } from '../../../utils/smartpos/formatDate';

export default function InquiriesSettings() {
  const [data, setData] = useState({ inquiries: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState({ open: false, inquiry: null });

  const fetchInquiries = () => {
    setLoading(true);
    getInquiries()
      .then(res => setData({ inquiries: res.inquiries || [], count: res.count || 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleResolve = async (id) => {
    try { await resolveInquiry(id); fetchInquiries(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try { await deleteInquiry(id); fetchInquiries(); } catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'message', label: 'Message', render: (row) => <span className="truncate max-w-xs block">{row.message}</span> },
    { key: 'resolved', label: 'Status', render: (row) => row.resolved ? <Badge variant="success">Resolved</Badge> : <Badge variant="warning">Pending</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, inquiry: row })}>View</Button>
        {!row.resolved && <Button size="sm" variant="success" onClick={() => handleResolve(row._id)}>Resolve</Button>}
        <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>Delete</Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Inquiries ({data.count})</h2>
      <Table columns={columns} data={data.inquiries} loading={loading} emptyMessage="No inquiries." />

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, inquiry: null })} title="Inquiry Details" size="md">
        {viewModal.inquiry && (
          <div className="space-y-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name:</span><span className="text-[var(--text-primary)]">{viewModal.inquiry.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email:</span><span className="text-[var(--text-primary)]">{viewModal.inquiry.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone:</span><span className="text-[var(--text-primary)]">{viewModal.inquiry.phone || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status:</span><Badge variant={viewModal.inquiry.resolved ? 'success' : 'warning'}>{viewModal.inquiry.resolved ? 'Resolved' : 'Pending'}</Badge></div>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-xs mb-1">Message:</p>
              <p className="text-[var(--text-primary)]">{viewModal.inquiry.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}