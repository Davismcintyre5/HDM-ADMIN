// src/pages/talanta/Tickets.jsx
import { useEffect, useState, useCallback } from 'react';
import { HiRefresh, HiCheck, HiX } from 'react-icons/hi';
import Card from '../../components/talanta/ui/Card';
import Table from '../../components/talanta/ui/Table';
import Badge from '../../components/talanta/ui/Badge';
import Button from '../../components/talanta/ui/Button';
import Select from '../../components/talanta/ui/Select';
import Pagination from '../../components/talanta/ui/Pagination';
import Modal from '../../components/talanta/ui/Modal';
import { useToast } from '../../context/talanta/ToastContext';
import { getTickets, updateTicketStatus } from '../../services/talanta/tickets';
import { TICKET_STATUSES, statusVariant } from '../../utils/talanta/constants';
import { formatDate, formatDateTime } from '../../utils/talanta/formatDate';
import { formatMoneyMajor } from '../../utils/talanta/formatMoney';
import { seatLabel } from '../../utils/talanta/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...TICKET_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
];

const NEXT_STATUSES = ['paid', 'used', 'void'];

export default function Tickets() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { items: list, meta: m } = await getTickets({
        page: p,
        limit: 20,
        status: status || undefined,
      });
      setItems(list);
      setMeta(m);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page, status]);

  const changeStatus = async (ticket, next) => {
    const id = ticket._id || ticket.id;
    setActionLoading(id);
    try {
      await updateTicketStatus(id, next);
      toast.success(`Ticket marked ${next}`);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'serial',
      label: 'Serial',
      render: (row) => (
        <button
          onClick={() => setViewTicket(row)}
          className="font-mono text-xs text-sky-600 hover:underline"
        >
          {row.serial}
        </button>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--text-primary)]">
            {row.categoryId?.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {row.categoryId?.section || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'seat',
      label: 'Seat',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {seatLabel(row.seat)}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-[var(--text-primary)]">
          {formatMoneyMajor(row.price, row.currency || 'KES')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {NEXT_STATUSES.filter((s) => s !== row.status).slice(0, 2).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === 'void' ? 'danger' : s === 'used' ? 'warning' : 'success'}
              onClick={() => changeStatus(row, s)}
              loading={actionLoading === (row._id || row.id)}
            >
              {s === 'void' ? <HiX className="w-4 h-4" /> : <HiCheck className="w-4 h-4" />}
              {s[0].toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tickets</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={STATUS_OPTIONS}
            />
          </div>
          <Button variant="outline" size="sm" icon={<HiRefresh className="w-4 h-4" />} onClick={() => load(page)} loading={loading}>
            Refresh
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
            emptyMessage="No tickets found"
          />
          <Pagination page={meta.page} totalPages={meta.pages} onPageChange={setPage} />
        </div>
      </Card>

      <Modal
        open={!!viewTicket}
        onClose={() => setViewTicket(null)}
        title="Ticket details"
        size="lg"
      >
        {viewTicket && (
          <div className="space-y-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <Row label="Serial">
                <span className="font-mono text-xs">{viewTicket.serial}</span>
              </Row>
              <Row label="Status">
                <Badge variant={statusVariant(viewTicket.status)} dot>{viewTicket.status}</Badge>
              </Row>
              <Row label="Category">{viewTicket.categoryId?.name || '—'}</Row>
              <Row label="Seat">{seatLabel(viewTicket.seat)}</Row>
              <Row label="Price">
                {formatMoneyMajor(viewTicket.price, viewTicket.currency || 'KES')}
              </Row>
              <Row label="Gate">{viewTicket.gate || '—'}</Row>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
              <Row label="Buyer">{viewTicket.buyer?.identifier || '—'}</Row>
              <Row label="Channel">{viewTicket.buyer?.channel || '—'}</Row>
              <Row label="Paid at">
                {viewTicket.paidAt ? formatDateTime(viewTicket.paidAt) : '—'}
              </Row>
              <Row label="Used at">
                {viewTicket.usedAt ? formatDateTime(viewTicket.usedAt) : '—'}
              </Row>
              <Row label="Created">{formatDateTime(viewTicket.createdAt)}</Row>
            </div>

            {viewTicket.qrCode && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <img
                  src={viewTicket.qrCode}
                  alt="QR"
                  className="w-48 h-48 border border-[var(--border-color)] rounded-lg bg-white p-2"
                />
                <p className="text-xs text-[var(--text-muted)]">QR code</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--text-secondary)] text-xs">{label}</span>
      <span className="text-[var(--text-primary)] text-xs text-right break-all">{children}</span>
    </div>
  );
}