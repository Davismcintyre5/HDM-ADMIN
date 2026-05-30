import { useEffect, useState } from 'react';
import { getContacts, markAsRead } from '../../services/portfolio/contacts';
import Card from '../../components/portfolio/ui/Card';
import Table from '../../components/portfolio/ui/Table';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Modal from '../../components/portfolio/ui/Modal';
import { formatDate } from '../../utils/portfolio/formatDate';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState({ open: false, contact: null });

  const fetchContacts = () => {
    setLoading(true);
    getContacts()
      .then(res => setContacts(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleMarkRead = async (id) => {
    try { await markAsRead(id); fetchContacts(); } catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'isRead', label: 'Status', render: (row) => row.isRead ? <Badge variant="success">Read</Badge> : <Badge variant="warning">New</Badge> },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, contact: row })}>View</Button>
        {!row.isRead && <Button size="sm" variant="success" onClick={() => handleMarkRead(row._id)}>Mark Read</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Messages</h1>
      <Card>
        <Table columns={columns} data={contacts} loading={loading} emptyMessage="No messages." />
      </Card>

      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, contact: null })} title="Message" size="md">
        {viewModal.contact && (
          <div className="space-y-3">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-sm"><span className="text-[var(--text-secondary)]">From:</span> <span className="font-medium">{viewModal.contact.name}</span></p>
              <p className="text-sm"><span className="text-[var(--text-secondary)]">Email:</span> {viewModal.contact.email}</p>
              <p className="text-sm"><span className="text-[var(--text-secondary)]">Date:</span> {formatDate(viewModal.contact.createdAt, 'full')}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Message:</p>
              <p className="text-[var(--text-primary)]">{viewModal.contact.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}