import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiPlay, HiPlus } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import Modal from '../../components/tvetgrid/ui/Modal';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { getLessons, createLesson } from '../../services/tvetgrid/lessons';
import { getCourses } from '../../services/tvetgrid/courses';
import { getSubjectsForCourse } from '../../services/tvetgrid/subjects';
import { formatDate } from '../../utils/tvetgrid/formatDate';

const PUBLISHED_FILTERS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Published' },
  { value: 'false', label: 'Draft' },
];

const EMPTY_FORM = {
  title: '',
  courseId: '',
  subjectId: '',
  order: 0,
  isPublished: false,
};

export default function Lessons() {
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

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(params.get('subjectId') || '');

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formSubjects, setFormSubjects] = useState([]);

  const loadLessons = () => {
    setLoading(true);
    getLessons({
      page,
      limit: 20,
      courseId: courseId || undefined,
      subjectId: subjectId || undefined,
      published: published || undefined,
    })
      .then((res) => {
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load lessons'))
      .finally(() => setLoading(false));
  };

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
    loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, courseId, subjectId, published]);

  useEffect(() => {
    if (!form.courseId) {
      setFormSubjects([]);
      return;
    }
    getSubjectsForCourse(form.courseId)
      .then((res) => setFormSubjects(res?.data || res || []))
      .catch(() => setFormSubjects([]));
  }, [form.courseId]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, courseId });
    setFormSubjects([]);
    setCreateOpen(true);
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
    setCreating(true);
    try {
      const res = await createLesson({
        title: form.title.trim(),
        courseId: form.courseId,
        subjectId: form.subjectId,
        order: Number(form.order) || 0,
        isPublished: form.isPublished,
      });
      const created = res?.data || res;
      toast.success('Lesson created');
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      if (created?._id) {
        navigate(`/tvetgrid/lessons/${created._id}`);
      } else {
        loadLessons();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Lesson',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.video?.url && (
            <span className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <HiPlay className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {row.title}
            </p>
            {row.video?.duration && (
              <p className="text-xs text-[var(--text-muted)]">
                {Math.round(row.video.duration / 60)} min
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'courseId',
      label: 'Course',
      render: (row) => {
        const c = courses.find((x) => (x._id || x.id) === row.courseId);
        return (
          <span className="text-sm text-[var(--text-secondary)]">
            {c?.title || '—'}
          </span>
        );
      },
    },
    {
      key: 'subjectId',
      label: 'Subject',
      render: (row) => {
        const s = subjects.find((x) => (x._id || x.id) === row.subjectId);
        return (
          <span className="text-sm text-[var(--text-secondary)]">
            {s?.name || '—'}
          </span>
        );
      },
    },
    {
      key: 'order',
      label: 'Order',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">
          {row.order ?? '—'}
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
            navigate(`/tvetgrid/lessons/${row._id || row.id}`);
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
            Lessons
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} lesson{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={openCreate}>
          New lesson
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
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
          </div>
          <div className="flex-1">
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
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={published}
              onChange={(e) => {
                setPublished(e.target.value);
                setPage(1);
              }}
              options={PUBLISHED_FILTERS}
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
              navigate(`/tvetgrid/lessons/${row._id || row.id}`)
            }
            emptyMessage="No lessons yet"
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
        title="New lesson"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>
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
            placeholder="Introduction to Voltage"
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
          <Input
            label="Order"
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
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
            After creating, you'll be able to upload the video from the lesson
            detail page.
          </p>
        </div>
      </Modal>
    </div>
  );
}