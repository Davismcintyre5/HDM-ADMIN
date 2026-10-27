import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiPlus, HiClipboardList, HiX } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import Modal from '../../components/tvetgrid/ui/Modal';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getPapers,
  createPaper,
  requestUploadSignature,
  confirmUpload,
} from '../../services/tvetgrid/papers';
import {
  uploadToCloudinary,
  PAPER_MAX_FILE_SIZE,
  PAPER_ALLOWED_TYPES,
} from '../../services/tvetgrid/upload';
import { getCourses } from '../../services/tvetgrid/courses';
import { getSubjectsForCourse } from '../../services/tvetgrid/subjects';

const PUBLISHED_FILTERS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Published' },
  { value: 'false', label: 'Draft' },
];

const ACCEPT = '.pdf,application/pdf';

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function buildTitle({ subject, year, paperNo }) {
  return [subject?.trim(), year, paperNo ? `Paper ${paperNo}` : null]
    .filter(Boolean)
    .join(' · ');
}

export default function Papers() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(params.get('courseId') || '');
  const [published, setPublished] = useState('');
  const [year, setYear] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(params.get('subjectId') || '');

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    courseId: params.get('courseId') || '',
    subjectId: '',
    subject: '',
    year: new Date().getFullYear(),
    paperNo: 1,
    durationMin: 120,
    isPublished: false,
    sourcePdf: null,
  });
  const [formSubjects, setFormSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(null);

  useEffect(() => {
    getCourses({ limit: 100 })
      .then((res) => setCourses(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!courseId) {
      setSubjects([]);
      setSubjectId('');
      return;
    }
    getSubjectsForCourse(courseId)
      .then((res) => setSubjects(res?.data || res || []))
      .catch(() => setSubjects([]));
  }, [courseId]);

  useEffect(() => {
    if (!form.courseId) {
      setFormSubjects([]);
      return;
    }
    getSubjectsForCourse(form.courseId)
      .then((res) => setFormSubjects(res?.data || res || []))
      .catch(() => setFormSubjects([]));
  }, [form.courseId]);

  const load = () => {
    setLoading(true);
    getPapers({
      page,
      limit: 20,
      courseId: courseId || undefined,
      subjectId: subjectId || undefined,
      published: published || undefined,
      year: year || undefined,
    })
      .then((res) => {
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load papers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, courseId, subjectId, published, year]);

  const handlePickPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > PAPER_MAX_FILE_SIZE) {
      toast.error(`Max ${formatBytes(PAPER_MAX_FILE_SIZE)} for paper PDFs`);
      return;
    }
    if (!PAPER_ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setUploadPct(0);
    try {
      const sigRes = await requestUploadSignature({});
      const sig = sigRes?.data || sigRes;

      const cloud = await uploadToCloudinary(file, sig, setUploadPct);

      const confirmRes = await confirmUpload({
        publicId: cloud.public_id,
        resourceType: cloud.resource_type || 'raw',
      });
      const confirmed = confirmRes?.data || confirmRes;

      setForm((prev) => ({
        ...prev,
        sourcePdf: {
          publicId: confirmed.publicId || cloud.public_id,
          url: confirmed.url || cloud.secure_url,
          fileName: file.name,
          size: confirmed.bytes || cloud.bytes,
          mimeType: confirmed.mimeType || file.type || 'application/pdf',
        },
      }));
      toast.success('PDF uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadPct(null);
    }
  };

  const openCreate = () => {
    setForm({
      title: '',
      courseId,
      subjectId,
      subject: '',
      year: new Date().getFullYear(),
      paperNo: 1,
      durationMin: 120,
      isPublished: false,
      sourcePdf: null,
    });
    setFormSubjects([]);
    setUploadPct(null);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.courseId) return toast.error('Course is required');
    if (!form.subjectId) return toast.error('Subject is required');
    if (!form.year) return toast.error('Year is required');
    if (!form.sourcePdf?.url) return toast.error('Upload the source PDF');

    const title = form.title?.trim() || buildTitle(form);
    if (title.length < 2) {
      return toast.error('Title is required');
    }

    setCreating(true);
    try {
      const res = await createPaper({
        courseId: form.courseId,
        subjectId: form.subjectId,
        title,
        year: Number(form.year),
        paperNo: form.paperNo ? Number(form.paperNo) : undefined,
        durationMin: form.durationMin ? Number(form.durationMin) : undefined,
        isPublished: form.isPublished,
        sourcePdf: {
          publicId: form.sourcePdf.publicId,
          url: form.sourcePdf.url,
          fileName: form.sourcePdf.fileName || null,
          size: form.sourcePdf.size || null,
          mimeType: form.sourcePdf.mimeType || 'application/pdf',
        },
      });
      const created = res?.data || res;
      toast.success('Paper created');
      setCreateOpen(false);
      if (created?._id) navigate(`/tvetgrid/papers/${created._id}`);
      else load();
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Paper',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
            <HiClipboardList className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {row.courseId?.title || '—'} · {row.year}
              {row.paperNo ? ` · Paper ${row.paperNo}` : ''}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {row.questions?.length || 0} questions
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'subjectId',
      label: 'Subject',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.subjectId?.name || '—'}
        </span>
      ),
    },
    {
      key: 'durationMin',
      label: 'Duration',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.durationMin ? `${row.durationMin} min` : '—'}
        </span>
      ),
    },
    {
      key: 'totalMarks',
      label: 'Marks',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.totalMarks ?? '—'}
        </span>
      ),
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isPublished ? 'success' : 'default'} dot>
          {row.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tvetgrid/papers/${row._id || row.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Papers
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} paper{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
          New paper
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSubjectId('');
              setPage(1);
            }}
            options={[
              { value: '', label: 'All courses' },
              ...courses.map((c) => ({
                value: c._id || c.id,
                label: c.title,
              })),
            ]}
          />
          <Select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All subjects' },
              ...subjects.map((s) => ({
                value: s._id || s.id,
                label: s.name,
              })),
            ]}
            disabled={!courseId}
          />
          <Input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            placeholder="Year"
          />
          <Select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              setPage(1);
            }}
            options={PUBLISHED_FILTERS}
          />
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) => navigate(`/tvetgrid/papers/${row._id || row.id}`)}
            emptyMessage="No papers yet"
          />
          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => !creating && !uploading && setCreateOpen(false)}
        title="New paper"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCreateOpen(false)}
              disabled={creating || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={uploading || !form.sourcePdf}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Auto-generated if blank"
            hint="e.g. Electrical · 2024 · Paper 1"
          />
          <Select
            label="Course *"
            value={form.courseId}
            onChange={(e) =>
              setForm({ ...form, courseId: e.target.value, subjectId: '' })
            }
            options={[
              { value: '', label: 'Select course...' },
              ...courses.map((c) => ({
                value: c._id || c.id,
                label: c.title,
              })),
            ]}
          />
          <Select
            label="Subject *"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            options={[
              { value: '', label: 'Select subject...' },
              ...formSubjects.map((s) => ({
                value: s._id || s.id,
                label: s.name,
              })),
            ]}
            disabled={!form.courseId}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Year *"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
            <Input
              label="Paper number"
              type="number"
              value={form.paperNo}
              onChange={(e) => setForm({ ...form, paperNo: e.target.value })}
            />
          </div>
          <Input
            label="Subject label"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Electrical"
            hint="Optional display label used in the auto-generated title"
          />
          <Input
            label="Duration (min)"
            type="number"
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Source PDF *
            </label>
            {form.sourcePdf ? (
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] truncate">
                    {form.sourcePdf.fileName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatBytes(form.sourcePdf.size)} · {form.sourcePdf.mimeType}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, sourcePdf: null }))}
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                  aria-label="Remove"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <label
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm cursor-pointer hover:bg-[var(--bg-secondary)] ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <HiPlus className="w-4 h-4" />
                  {uploading ? 'Uploading…' : 'Upload PDF'}
                  <input
                    type="file"
                    accept={ACCEPT}
                    onChange={handlePickPdf}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploadPct !== null && (
                  <div className="mt-2">
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  PDF only · max {formatBytes(PAPER_MAX_FILE_SIZE)}
                </p>
              </>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
            />
            Publish immediately
          </label>
          <p className="text-xs text-[var(--text-muted)]">
            Course and subject cannot be changed after creation.
          </p>
        </div>
      </Modal>
    </div>
  );
}