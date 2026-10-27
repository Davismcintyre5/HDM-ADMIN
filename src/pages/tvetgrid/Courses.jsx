import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Table from '../../components/tvetgrid/ui/Table';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import SearchBar from '../../components/tvetgrid/ui/SearchBar';
import Pagination from '../../components/tvetgrid/ui/Pagination';
import Modal from '../../components/tvetgrid/ui/Modal';
import ConfirmDialog from '../../components/tvetgrid/ui/ConfirmDialog';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getCourses,
  createCourse,
  deleteCourse,
} from '../../services/tvetgrid/courses';
import { formatDate } from '../../utils/tvetgrid/formatDate';

const PUBLISHED_FILTERS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Published' },
  { value: 'false', label: 'Draft' },
];

const EMPTY_FORM = {
  title: '',
  subject: '',
  syllabusCode: '',
  description: '',
  isPublished: false,
};

export default function Courses() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState('');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    course: null,
  });

  const load = () => {
    setLoading(true);
    getCourses({
      page,
      limit: 20,
      q: search || undefined,
      published: published || undefined,
    })
      .then((res) => {
        setItems(res?.data || []);
        setMeta(res?.meta || { page: 1, pages: 1, total: 0 });
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, published]);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const res = await createCourse({
        title: form.title.trim(),
        subject: form.subject.trim() || undefined,
        syllabusCode: form.syllabusCode.trim() || undefined,
        description: form.description.trim() || undefined,
        isPublished: form.isPublished,
      });
      const created = res?.data || res;
      toast.success('Course created — now add its first subject');
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      if (created?._id) {
        navigate(`/tvetgrid/courses/${created._id}`);
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.course) return;
    try {
      await deleteCourse(confirmDelete.course._id || confirmDelete.course.id);
      toast.success('Course deleted');
      setConfirmDelete({ open: false, course: null });
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Course',
      render: (row) => {
        const subjCount =
          row.subjects?.length ??
          (typeof row.subjectCount === 'number' ? row.subjectCount : null);

        return (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-[var(--text-primary)]">
                {row.title}
              </p>
              {subjCount === 0 && (
                <Badge variant="warning" dot>
                  No subjects
                </Badge>
              )}
              {subjCount !== null && subjCount > 0 && (
                <Badge variant="default">
                  {subjCount} subject{subjCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              {row.slug}
            </p>
          </div>
        );
      },
    },
    {
      key: 'subject',
      label: 'Subject label',
      render: (row) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.subject || '—'}
        </span>
      ),
    },
    {
      key: 'syllabusCode',
      label: 'Syllabus',
      render: (row) => (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {row.syllabusCode || '—'}
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
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tvetgrid/courses/${row._id || row.id}`);
            }}
            title="Edit"
          >
            <HiPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete({ open: true, course: row });
            }}
            title="Delete"
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Courses
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {meta.total} course{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          icon={<HiPlus className="w-4 h-4" />}
          onClick={() => {
            setForm(EMPTY_FORM);
            setCreateOpen(true);
          }}
        >
          New course
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search courses..."
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
              navigate(`/tvetgrid/courses/${row._id || row.id}`)
            }
            emptyMessage="No courses yet"
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
        title="New course"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => patch('title', e.target.value)}
            placeholder="Basic Electricity"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject label"
              value={form.subject}
              onChange={(e) => patch('subject', e.target.value)}
              placeholder="Electrical"
              hint="Optional display label — different from the Subjects hierarchy"
            />
            <Input
              label="Syllabus code"
              value={form.syllabusCode}
              onChange={(e) => patch('syllabusCode', e.target.value)}
              placeholder="ELEC-101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => patch('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
              placeholder="Course overview..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => patch('isPublished', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
            />
            Publish immediately
          </label>
          <p className="text-xs text-[var(--text-muted)]">
            After creating, you'll be taken to the course page to add its first
            subject.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, course: null })}
        onConfirm={handleDelete}
        title="Delete course"
        message={`Delete "${confirmDelete.course?.title}"? All subjects, lessons, notes, and papers under this course will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}