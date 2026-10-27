import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiPlus,
  HiTrash,
  HiSave,
  HiPencil,
  HiBookOpen,
  HiVideoCamera,
  HiDocumentText,
  HiClipboardList,
  HiChevronUp,
  HiChevronDown,
  HiExclamation,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Modal from '../../components/tvetgrid/ui/Modal';
import ConfirmDialog from '../../components/tvetgrid/ui/ConfirmDialog';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { getCourse, updateCourse } from '../../services/tvetgrid/courses';
import {
  getSubjectsForCourse,
  createSubject,
  updateSubject,
  deleteSubject,
  reorderSubjects,
} from '../../services/tvetgrid/subjects';
import { getLessons } from '../../services/tvetgrid/lessons';
import { getNotes } from '../../services/tvetgrid/notes';
import { getPapers } from '../../services/tvetgrid/papers';

const TABS = [
  { key: 'subjects', label: 'Subjects', icon: HiBookOpen },
  { key: 'lessons', label: 'Lessons', icon: HiVideoCamera },
  { key: 'notes', label: 'Notes', icon: HiDocumentText },
  { key: 'papers', label: 'Papers', icon: HiClipboardList },
];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('subjects');

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [syllabusCode, setSyllabusCode] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectModal, setSubjectModal] = useState({ open: false, mode: 'create', subject: null });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '', order: 0 });
  const [savingSubject, setSavingSubject] = useState(false);
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState({ open: false, subject: null });

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [papers, setPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(false);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await getCourse(id);
      const c = res?.data || res;
      setCourse(c);
      setTitle(c.title || '');
      setSubject(c.subject || '');
      setSyllabusCode(c.syllabusCode || '');
      setDescription(c.description || '');
      setIsPublished(!!c.isPublished);
      if (Array.isArray(c.subjects)) {
        setSubjects(c.subjects);
      } else {
        loadSubjects();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load course');
      navigate('/tvetgrid/courses');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = () => {
    setSubjectsLoading(true);
    getSubjectsForCourse(id)
      .then((res) => setSubjects(res?.data || res || []))
      .catch((err) => toast.error(err.message || 'Failed to load subjects'))
      .finally(() => setSubjectsLoading(false));
  };

  const loadLessons = () => {
    setLessonsLoading(true);
    getLessons({ courseId: id, limit: 100 })
      .then((res) => setLessons(res?.data || []))
      .catch((err) => toast.error(err.message || 'Failed to load lessons'))
      .finally(() => setLessonsLoading(false));
  };

  const loadNotes = () => {
    setNotesLoading(true);
    getNotes({ courseId: id, limit: 100 })
      .then((res) => setNotes(res?.data || []))
      .catch((err) => toast.error(err.message || 'Failed to load notes'))
      .finally(() => setNotesLoading(false));
  };

  const loadPapers = () => {
    setPapersLoading(true);
    getPapers({ courseId: id, limit: 100 })
      .then((res) => setPapers(res?.data || []))
      .catch((err) => toast.error(err.message || 'Failed to load papers'))
      .finally(() => setPapersLoading(false));
  };

  useEffect(() => {
    loadCourse();
    loadLessons();
    loadNotes();
    loadPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveCourse = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSavingCourse(true);
    try {
      const res = await updateCourse(id, {
        title: title.trim(),
        subject: subject.trim(),
        syllabusCode: syllabusCode.trim(),
        description: description.trim(),
        isPublished,
      });
      const updated = res?.data || res;
      if (updated) setCourse(updated);
      toast.success('Course saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSavingCourse(false);
    }
  };

  const openCreateSubject = () => {
    setSubjectForm({ name: '', code: '', description: '', order: subjects.length });
    setSubjectModal({ open: true, mode: 'create', subject: null });
  };

  const openEditSubject = (s) => {
    setSubjectForm({
      name: s.name,
      code: s.code || '',
      description: s.description || '',
      order: s.order || 0,
    });
    setSubjectModal({ open: true, mode: 'edit', subject: s });
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    setSavingSubject(true);
    try {
      if (subjectModal.mode === 'create') {
        await createSubject({
          courseId: id,
          name: subjectForm.name.trim(),
          code: subjectForm.code.trim() || undefined,
          description: subjectForm.description.trim() || undefined,
          order: subjectForm.order,
        });
        toast.success('Subject created');
      } else {
        await updateSubject(subjectModal.subject._id, {
          name: subjectForm.name.trim(),
          code: subjectForm.code.trim() || null,
          description: subjectForm.description.trim() || null,
          order: subjectForm.order,
        });
        toast.success('Subject updated');
      }
      setSubjectModal({ open: false, mode: 'create', subject: null });
      loadSubjects();
    } catch (err) {
      toast.error(err.message || 'Failed to save subject');
    } finally {
      setSavingSubject(false);
    }
  };

  const requestDeleteSubject = (subjectItem) => {
    if (subjects.length <= 1) {
      toast.error('A course must have at least one subject');
      return;
    }
    setConfirmDeleteSubject({ open: true, subject: subjectItem });
  };

  const handleDeleteSubject = async () => {
    if (!confirmDeleteSubject.subject) return;
    try {
      await deleteSubject(confirmDeleteSubject.subject._id);
      toast.success('Subject deleted');
      setConfirmDeleteSubject({ open: false, subject: null });
      loadSubjects();
      loadLessons();
      loadNotes();
      loadPapers();
    } catch (err) {
      if (err.code === 'LAST_SUBJECT') {
        toast.error('A course must have at least one subject');
      } else {
        toast.error(err.message || 'Failed to delete subject');
      }
    }
  };

  const moveSubject = async (index, direction) => {
    const newSubjects = [...subjects];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newSubjects.length) return;

    [newSubjects[index], newSubjects[swapIdx]] = [newSubjects[swapIdx], newSubjects[index]];

    const items = newSubjects.map((s, i) => ({ id: s._id || s.id, order: i + 1 }));
    try {
      await reorderSubjects(items);
      setSubjects(newSubjects.map((s, i) => ({ ...s, order: i + 1 })));
    } catch (err) {
      toast.error(err.message || 'Failed to reorder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!course) return null;

  const hasSubjects = subjects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/courses')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {course.title}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">
            {course.slug}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!hasSubjects && (
            <Badge variant="warning" dot>
              No subjects yet
            </Badge>
          )}
          <Badge variant={course.isPublished ? 'success' : 'default'} dot>
            {course.isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </div>

      {!hasSubjects && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
          <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Add at least one subject</p>
            <p className="mt-1 text-xs opacity-90">
              Lessons, notes, and papers attach to a subject. Add the first
              subject below before creating content.
            </p>
          </div>
        </div>
      )}

      <Card title="Course details">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Subject label"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              hint="Display label — different from the subjects below"
            />
          </div>
          <Input
            label="Syllabus code"
            value={syllabusCode}
            onChange={(e) => setSyllabusCode(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
              />
              Published
            </label>
            <Button
              icon={<HiSave className="w-4 h-4" />}
              onClick={handleSaveCourse}
              loading={savingCourse}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-[var(--border-color)] overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const disabled = t.key !== 'subjects' && !hasSubjects;
          return (
            <button
              key={t.key}
              onClick={() => !disabled && setTab(t.key)}
              disabled={disabled}
              title={disabled ? 'Add a subject first' : undefined}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.key
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : disabled
                  ? 'border-transparent text-[var(--text-muted)] cursor-not-allowed opacity-50'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              type="button"
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'subjects' && (
        <Card
          title={`Subjects${subjects.length > 0 ? ` (${subjects.length})` : ''}`}
          description={
            subjects.length === 0
              ? 'Add at least one subject before creating lessons, notes, or papers'
              : undefined
          }
          actions={
            <Button
              size="sm"
              icon={<HiPlus className="w-4 h-4" />}
              onClick={openCreateSubject}
            >
              Add subject
            </Button>
          }
          padding={false}
        >
          {subjectsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
              <HiBookOpen className="w-10 h-10 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                Every course needs at least one subject before you can add
                lessons, notes, or papers.
              </p>
              <Button
                size="sm"
                icon={<HiPlus className="w-4 h-4" />}
                onClick={openCreateSubject}
              >
                Add first subject
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {subjects.map((s, i) => {
                const isOnly = subjects.length === 1;
                return (
                  <li
                    key={s._id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-mono text-[var(--text-muted)] w-6 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {s.name}
                        </p>
                        {s.code && (
                          <p className="text-[10px] font-mono text-[var(--text-muted)]">
                            {s.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSubject(i, -1)}
                        disabled={i === 0}
                        title="Move up"
                      >
                        <HiChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSubject(i, 1)}
                        disabled={i === subjects.length - 1}
                        title="Move down"
                      >
                        <HiChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditSubject(s)}
                      >
                        <HiPencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => requestDeleteSubject(s)}
                        disabled={isOnly}
                        title={
                          isOnly
                            ? 'Cannot delete the only subject'
                            : 'Delete subject'
                        }
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {tab === 'lessons' && hasSubjects && (
        <Card
          title={`Lessons (${lessons.length})`}
          actions={
            <Button
              size="sm"
              onClick={() => navigate(`/tvetgrid/lessons?courseId=${id}`)}
            >
              Manage lessons
            </Button>
          }
          padding={false}
        >
          {lessonsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : lessons.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-12 text-center">
              No lessons yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {lessons.map((l) => (
                <li key={l._id}>
                  <button
                    onClick={() => navigate(`/tvetgrid/lessons/${l._id}`)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                    type="button"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {l.title}
                      </p>
                      {l.video?.duration && (
                        <p className="text-xs text-[var(--text-muted)]">
                          {Math.round(l.video.duration / 60)} min video
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={l.isPublished ? 'success' : 'default'}
                      dot
                    >
                      {l.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'notes' && hasSubjects && (
        <Card
          title={`Notes (${notes.length})`}
          actions={
            <Button
              size="sm"
              onClick={() => navigate(`/tvetgrid/notes?courseId=${id}`)}
            >
              Manage notes
            </Button>
          }
          padding={false}
        >
          {notesLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-12 text-center">
              No notes yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {notes.map((n) => (
                <li key={n._id}>
                  <button
                    onClick={() => navigate(`/tvetgrid/notes/${n._id}`)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                    type="button"
                  >
                    <p className="text-sm text-[var(--text-primary)] truncate">
                      {n.title}
                    </p>
                    <Badge variant="default">
                      {n.visibility || 'public'}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'papers' && hasSubjects && (
        <Card
          title={`Papers (${papers.length})`}
          actions={
            <Button
              size="sm"
              onClick={() => navigate(`/tvetgrid/papers?courseId=${id}`)}
            >
              Manage papers
            </Button>
          }
          padding={false}
        >
          {papersLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : papers.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-12 text-center">
              No papers yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {papers.map((p) => (
                <li key={p._id}>
                  <button
                    onClick={() => navigate(`/tvetgrid/papers/${p._id}`)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between gap-3"
                    type="button"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {p.year} {p.paperNo ? `· Paper ${p.paperNo}` : ''}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {p.totalMarks || 0} marks · {p.questions?.length || 0}{' '}
                        questions
                      </p>
                    </div>
                    <Badge
                      variant={p.isPublished ? 'success' : 'default'}
                      dot
                    >
                      {p.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Modal
        open={subjectModal.open}
        onClose={() =>
          setSubjectModal({ open: false, mode: 'create', subject: null })
        }
        title={subjectModal.mode === 'create' ? 'New subject' : 'Edit subject'}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                setSubjectModal({ open: false, mode: 'create', subject: null })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSubject} loading={savingSubject}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={subjectForm.name}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, name: e.target.value })
            }
            placeholder="Basic Electricity"
          />
          <Input
            label="Code"
            value={subjectForm.code}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, code: e.target.value })
            }
            placeholder="ELEC-1.1"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={subjectForm.description}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
            />
          </div>
          <Input
            label="Order"
            type="number"
            value={subjectForm.order}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, order: Number(e.target.value) })
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteSubject.open}
        onClose={() =>
          setConfirmDeleteSubject({ open: false, subject: null })
        }
        onConfirm={handleDeleteSubject}
        title="Delete subject"
        message={`Delete "${confirmDeleteSubject.subject?.name}"? Notes in this subject will be deleted; lessons and papers will be unpublished. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}