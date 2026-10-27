import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiVideoCamera, HiExternalLink } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Select from '../../components/tvetgrid/ui/Select';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { getMeetings } from '../../services/tvetgrid/meetings';
import { formatDateTime, relativeTime } from '../../utils/tvetgrid/formatDate';
import { MEETING_STATUS_LIST, statusLabel } from '../../utils/tvetgrid/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...MEETING_STATUS_LIST,
];

export default function Meetings() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMeetings({ page, limit: 20, status: status || undefined })
      .then((res) => {
        if (cancelled) return;
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Failed to load meetings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const columns = [
    {
      key: 'title',
      label: 'Meeting',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
              row.status === 'live'
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-indigo-100 dark:bg-indigo-900/30'
            }`}
          >
            <HiVideoCamera
              className={`w-4 h-4 ${
                row.status === 'live'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}
            />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {row.title}
            </p>
            {row.host?.name && (
              <p className="text-xs text-[var(--text-muted)] truncate">
                Host: {row.host.name}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'live'
              ? 'danger'
              : row.status === 'scheduled'
              ? 'info'
              : 'default'
          }
          dot
          className={row.status === 'live' ? 'animate-pulse' : undefined}
        >
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.scheduledAt ? formatDateTime(row.scheduledAt) : '—'}
        </span>
      ),
    },
    {
      key: 'startedAt',
      label: 'Started',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.startedAt ? relativeTime(row.startedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'endedAt',
      label: 'Ended',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.endedAt ? relativeTime(row.endedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tvetgrid/meetings/${row._id || row.id}`);
            }}
          >
            View
          </Button>
          {row.recordingUrl && (
            <Button
              size="sm"
              variant="ghost"
              icon={<HiExternalLink className="w-3.5 h-3.5" />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.recordingUrl, '_blank', 'noopener,noreferrer');
              }}
              title="Open recording"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Meetings
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {meta.total} meeting{meta.total !== 1 ? 's' : ''} · read-only oversight
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) =>
              navigate(`/tvetgrid/meetings/${row._id || row.id}`)
            }
            emptyMessage="No meetings yet"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}