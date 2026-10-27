import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiPlus, HiDocumentText, HiX } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import SearchBar from '../../components/tvetgrid/ui/SearchBar';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import Modal from '../../components/tvetgrid/ui/Modal';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getNotes,
  createNote,
  requestUploadSignature,
  confirmUpload,
} from '../../services/tvetgrid/notes';
import {
  uploadToCloudinary,
  NOTE_ALLOWED_TYPES,
  NOTE_MAX_FILE_SIZE,
  NOTE_MAX_FILES,
} from '../../services/tvetgrid/upload';
import { getCourses } from '../../services/tvetgrid/courses';
import { getSubjectsForCourse } from '../../services/tvetgrid/subjects';
import { formatDate } from '../../utils/tvetgrid/formatDate';
import { NOTE_VISIBILITY_LIST } from '../../utils/tvetgrid/constants';

const VISIBILITY_FILTERS = [
  { value: '', label: 'All visibility' },
  ...NOTE_VISIBILITY_LIST,
];

const ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.webp,.docx,application/pdf,image/png,image/jpeg,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function Notes() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(params.get('courseId') || '');
  const [visibility, setVisibility] = useState('');
  const [search, setSearch] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(params.get('subjectId') || '');

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: params.get('courseId') || '',
    subjectId: '',
    visibility: 'public',
    files: [],
  });
  const [formSubjects, setFormSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

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
    getNotes({
      page,
      limit: 20,
      courseId: courseId || undefined,
      subjectId: subjectId || undefined,
      visibility: visibility || undefined,
      q: search || undefined,
    })
      .then((res) => {
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load notes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, courseId, subjectId, visibility, search]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    if (form.files.length + files.length > NOTE_MAX_FILES) {
      toast.error(`Max ${NOTE_MAX_FILES} files per note`);
      return;
    }

    for (const file of files) {
      if (file.size > NOTE_MAX_FILE_SIZE) {
        toast.error(`${file.name}: max 10 MB`);
        continue;
      }
      if (!NOTE_ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported file type`);
        continue;
      }

      const tempId = `${Date.now()}-${file.name}`;
      setUploadProgress((p) => ({ ...p, [tempId]: 0 }));
      setUploading(true);

      try {
        const sigRes = await requestUploadSignature({});
        const sig = sigRes?.data || sigRes;

        const cloudRes = await uploadToCloudinary(file, sig, (pct) => {
          setUploadProgress((p) => ({ ...p, [tempId]: pct }));
        });

        const confirmRes = await confirmUpload({
          publicId: cloudRes.public_id,
          resourceType: cloudRes.resource_type || 'auto',
        });
        const confirmed = confirmRes?.data || confirmRes;

        const fileRecord = {
          publicId: confirmed.publicId || cloudRes.public_id,
          url: confirmed.url || cloudRes.secure_url,
          fileName: file.name,
          size: confirmed.bytes || cloudRes.bytes,
          mimeType: file.type,
          resourceType: confirmed.resourceType || cloudRes.resource_type || 'auto',
        };

        setForm((prev) => ({ ...prev, files: [...prev.files, fileRecord] }));
      } catch (err) {
        toast.error(`${file.name}: ${err.message || 'upload failed'}`);
      } finally {
        setUploadProgress((p) => {
          const n = { ...p };
          delete n[tempId];
          return n;
        });
        setUploading(false);
      }
    }
  };

  const removeFile = (idx) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== idx),
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.courseId) {
      toast.error('Course is required');
      return;
    }
    if (!form.subjectId) {
      toast.error('Subject is required');
      return;
    }
    if (form.files.length === 0) {
      toast.error('Upload at least 1 file');
      return;
    }
    setCreating(true);
    try {
      const res = await createNote({
        courseId: form.courseId,
        subjectId: form.subjectId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        files: form.files,
        visibility: form.visibility,
      });
      const created = res?.data || res;
      toast.success('Note created');
      setCreateOpen(false);
      if (created?._id) navigate(`/tvetgrid/notes/${created._id}`);
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
      label: 'Note',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <HiDocumentText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {row.title}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {row.files?.length || 0} file{(row.files?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.courseId?.title || '—'}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.subjectId?.name || '—'}
        </span>
      ),
    },
    {
      key: 'visibility',
      label: 'Visibility',
      render: (row) => (
        <Badge variant={row.visibility === 'public' ? 'info' : 'default'}>
          {row.visibility || 'public'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
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
            navigate(`/tvetgrid/notes/${row._id || row.id}`);
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
            Notes
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} note{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          icon={<HiPlus className="w-4 h-4" />}
          onClick={() => {
            setForm({
              title: '',
              description: '',
              courseId: courseId || '',
              subjectId: '',
              visibility: 'public',
              files: [],
            });
            setFormSubjects([]);
            setUploadProgress({});
            setCreateOpen(true);
          }}
        >
          New note
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search notes..."
          />
          <Select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
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
          <Select
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value);
              setPage(1);
            }}
            options={VISIBILITY_FILTERS}
          />
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            rowKey={(r) => r._id || r.id}
            onRowClick={(row) => navigate(`/tvetgrid/notes/${row._id || row.id}`)}
            emptyMessage="No notes yet"
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
        onClose={() => setCreateOpen(false)}
        title="New note"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCreateOpen(false)}
              disabled={creating || uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating} disabled={uploading}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ohm Law Cheatsheet"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Quick reference"
            hint="Optional short description"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Course *"
              value={form.courseId}
              onChange={(e) =>
                setForm({ ...form, courseId: e.target.value, subjectId: '' })
              }
              options={[
                { value: '', label: 'Select...' },
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
                { value: '', label: 'Select...' },
                ...formSubjects.map((s) => ({
                  value: s._id || s.id,
                  label: s.name,
                })),
              ]}
              disabled={!form.courseId}
            />
          </div>
          <Select
            label="Visibility"
            value={form.visibility}
            onChange={(e) => setForm({ ...form, visibility: e.target.value })}
            options={NOTE_VISIBILITY_LIST}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Files * ({form.files.length}/{NOTE_MAX_FILES})
            </label>

            {form.files.length > 0 && (
              <ul className="space-y-2 mb-3">
                {form.files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[var(--text-primary)] truncate">
                        {f.fileName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatBytes(f.size)} · {f.mimeType}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                      aria-label="Remove"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {Object.entries(uploadProgress).map(([id, pct]) => (
              <div key={id} className="mb-2">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span className="truncate">{id.split('-').slice(1).join('-')}</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}

            <label
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm cursor-pointer hover:bg-[var(--bg-secondary)] ${
                form.files.length >= NOTE_MAX_FILES || uploading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <HiPlus className="w-4 h-4" />
              Add file
              <input
                type="file"
                multiple
                accept={ACCEPT}
                onChange={handleFileSelect}
                className="hidden"
                disabled={form.files.length >= NOTE_MAX_FILES || uploading}
              />
            </label>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              PDF, PNG, JPG, WEBP, DOCX · max 10 MB per file · up to 5 files
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}