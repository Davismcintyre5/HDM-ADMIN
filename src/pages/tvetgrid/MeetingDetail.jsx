import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiVideoCamera,
  HiExternalLink,
  HiUserGroup,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Table from '../../components/tvetgrid/ui/Table';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getMeeting,
  getMeetingAttendance,
  getMeetingRecording,
} from '../../services/tvetgrid/meetings';
import { formatDateTime, relativeTime } from '../../utils/tvetgrid/formatDate';
import { statusLabel } from '../../utils/tvetgrid/constants';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [meeting, setMeeting] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getMeeting(id).catch((err) => {
        throw err;
      }),
      getMeetingAttendance(id).catch(() => null),
      getMeetingRecording(id).catch(() => null),
    ])
      .then(([m, a, r]) => {
        if (cancelled) return;
        setMeeting(m?.data || m);
        setAttendance(a?.data || a || null);
        setRecording(r?.data || r || null);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err.message || 'Failed to load meeting');
          navigate('/tvetgrid/meetings');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!meeting) return null;

  const invites = attendance?.invites || [];
  const total = attendance?.total ?? 0;
  const attended = attendance?.attended ?? 0;

  const inviteColumns = [
    {
      key: 'name',
      label: 'Invitee',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {row.name || '—'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
          {row.phone && (
            <p className="text-xs font-mono text-[var(--text-muted)]">
              {row.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'rsvp',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.rsvp === 'attended'
              ? 'success'
              : row.rsvp === 'absent'
              ? 'danger'
              : 'info'
          }
          dot
        >
          {statusLabel(row.rsvp)}
        </Badge>
      ),
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.joinedAt ? relativeTime(row.joinedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'leftAt',
      label: 'Left',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.leftAt ? relativeTime(row.leftAt) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/meetings')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {meeting.title}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Read-only oversight — meetings are created by teachers
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              meeting.status === 'live'
                ? 'danger'
                : meeting.status === 'scheduled'
                ? 'info'
                : 'default'
            }
            dot
            className={meeting.status === 'live' ? 'animate-pulse' : undefined}
          >
            {statusLabel(meeting.status)}
          </Badge>
          {meeting.recordingUrl && (
            <Button
              size="sm"
              variant="outline"
              icon={<HiExternalLink className="w-3.5 h-3.5" />}
              onClick={() =>
                window.open(meeting.recordingUrl, '_blank', 'noopener,noreferrer')
              }
            >
              Open recording
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Schedule">
          <dl className="space-y-2 text-sm">
            <Row label="Scheduled">
              {meeting.scheduledAt ? formatDateTime(meeting.scheduledAt) : '—'}
            </Row>
            <Row label="Started">
              {meeting.startedAt ? formatDateTime(meeting.startedAt) : '—'}
            </Row>
            <Row label="Ended">
              {meeting.endedAt ? formatDateTime(meeting.endedAt) : '—'}
            </Row>
          </dl>
        </Card>

        <Card title="Host">
          <dl className="space-y-2 text-sm">
            <Row label="Name">{meeting.host?.name || '—'}</Row>
            <Row label="Email">{meeting.host?.email || '—'}</Row>
          </dl>
        </Card>

        <Card title="Attendance">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">Rate</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {total > 0 ? Math.round((attended / total) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 mb-3">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{
                width: `${total > 0 ? (attended / total) * 100 : 0}%`,
              }}
            />
          </div>
          <dl className="space-y-1 text-xs text-[var(--text-secondary)]">
            <Row label="Invited">{total}</Row>
            <Row label="Attended">{attended}</Row>
            <Row label="Missed">{total - attended}</Row>
          </dl>
        </Card>
      </div>

      {recording?.recordingUrl && (
        <Card title="Recording">
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {recording.title}
            {recording.endedAt && (
              <span className="text-[var(--text-muted)]">
                {' '}
                · ended {relativeTime(recording.endedAt)}
              </span>
            )}
          </p>
          <Button
            icon={<HiVideoCamera className="w-4 h-4" />}
            onClick={() =>
              window.open(recording.recordingUrl, '_blank', 'noopener,noreferrer')
            }
          >
            Watch recording
          </Button>
        </Card>
      )}

      <Card title={`Invitees (${invites.length})`} padding={false}>
        <div className="p-4">
          <Table
            columns={inviteColumns}
            data={invites}
            loading={false}
            rowKey={(r, i) => r.email || i}
            emptyMessage="No invitees"
          />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--text-secondary)] text-xs">{label}</dt>
      <dd className="text-[var(--text-primary)] text-xs text-right">
        {children}
      </dd>
    </div>
  );
}