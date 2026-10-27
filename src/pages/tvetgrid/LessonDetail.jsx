import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiSave,
  HiVideoCamera,
  HiUpload,
  HiSparkles,
  HiTrash,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import ConfirmDialog from '../../components/tvetgrid/ui/ConfirmDialog';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getLesson,
  updateLesson,
  deleteLesson,
  requestUploadSignature,
  summarizeLesson,
} from '../../services/tvetgrid/lessons';
import { getCourses } from '../../services/tvetgrid/courses';
import { getSubjectsForCourse } from '../../services/tvetgrid/subjects';
import { formatDate } from '../../utils/tvetgrid/formatDate';

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [order, setOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summarizing, setSummarizing] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [coursesRes, lessonRes] = await Promise.all([
        getCourses({ limit: 100 }).catch(() => ({ data: [] })),
        getLesson(id),
      ]);

      setCourses(coursesRes?.data || []);

      const l = lessonRes?.data || lessonRes;
      setLesson(l);
      setTitle(l.title || '');
      setCourseId(l.courseId || '');
      setSubjectId(l.subjectId || '');
      setOrder(l.order ?? 0);
      setIsPublished(!!l.isPublished);
    } catch (err) {
      toast.error(err.message || 'Failed to load lesson');
      navigate('/tvetgrid/lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!courseId) {
      setSubjects([]);
      return;
    }
    getSubjectsForCourse(courseId)
      .then((res) => setSubjects(res?.data || res || []))
      .catch(() => setSubjects([]));
  }, [courseId]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!courseId) {
      toast.error('Course is required');
      return;
    }
    if (!subjectId) {
      toast.error('Subject is required');
      return;
    }
    setSaving(true);
    try {
      const res = await updateLesson(id, {
        title: title.trim(),
        courseId,
        subjectId,
        order: Number(order) || 0,
        isPublished,
      });
      const updated = res?.data || res;
      if (updated) setLesson(updated);
      toast.success('Lesson saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      toast.error('Max video size is 500 MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const sigRes = await requestUploadSignature({ resourceType: 'video' });
      const sig = sigRes?.data || sigRes;

      if (!sig?.signature || !sig?.uploadUrl) {
        throw new Error('Invalid upload signature response');
      }

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', sig.timestamp);
      form.append('signature', sig.signature);
      form.append('folder', sig.folder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', sig.uploadUrl);

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      const cloudRes = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid response from Cloudinary'));
            }
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.send(form);
      });

      const video = {
        publicId: cloudRes.public_id,
        url: cloudRes.secure_url,
        duration: cloudRes.duration || null,
        format: cloudRes.format || 'mp4',
      };
      const res = await updateLesson(id, { video });
      const updated = res?.data || res;
      if (updated) setLesson(updated);
      toast.success('Video uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await summarizeLesson(id);
      const data = res?.data || res;
      toast.success(
        data?.jobId
          ? `AI summary queued (job ${data.jobId})`
          : 'AI summary queued'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to queue summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLesson(id);
      toast.success('Lesson deleted');
      navigate('/tvetgrid/lessons');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/lessons')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {lesson.title || 'Lesson'}
          </h1>
          {lesson.createdAt && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Created {formatDate(lesson.createdAt, 'full')}
            </p>
          )}
        </div>
        <Badge variant={isPublished ? 'success' : 'default'} dot>
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <Card title="Details">
        <div className="space-y-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Course *"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setSubjectId('');
              }}
              options={[
                { value: '', label: 'Select a course...' },
                ...courses.map((c) => ({
                  value: c._id || c.id,
                  label: c.title,
                })),
              ]}
            />
            <Select
              label="Subject *"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={[
                { value: '', label: 'Select subject...' },
                ...subjects.map((s) => ({
                  value: s._id || s.id,
                  label: s.name,
                })),
              ]}
              disabled={!courseId}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
            <div className="pt-6">
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
                />
                Published
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              icon={<HiSave className="w-4 h-4" />}
              onClick={handleSave}
              loading={saving}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Video">
        {lesson?.video?.url ? (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border border-[var(--border-color)] bg-black">
              <video
                src={lesson.video.url}
                controls
                className="w-full max-h-96"
                preload="metadata"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-[var(--text-muted)]">
                {lesson.video.format?.toUpperCase()}
                {lesson.video.duration
                  ? ` · ${Math.round(lesson.video.duration / 60)} min`
                  : ''}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<HiUpload className="w-3.5 h-3.5" />}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Replace video'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<HiSparkles className="w-3.5 h-3.5" />}
                  onClick={handleSummarize}
                  loading={summarizing}
                >
                  AI Summarize
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <HiVideoCamera className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              No video uploaded yet
            </p>
            <Button
              icon={<HiUpload className="w-4 h-4" />}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload video'}
            </Button>
          </div>
        )}

        {uploading && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Uploading</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={handleUploadVideo}
          className="hidden"
        />
      </Card>

      {Array.isArray(lesson?.transcript) && lesson.transcript.length > 0 && (
        <Card title={`Transcript (${lesson.transcript.length} segments)`}>
          <ul className="space-y-1 max-h-64 overflow-y-auto text-xs">
            {lesson.transcript.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-[var(--text-muted)] shrink-0">
                  {Math.floor(s.t / 60)}:{String(s.t % 60).padStart(2, '0')}
                </span>
                <span className="text-[var(--text-primary)]">{s.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {Array.isArray(lesson?.resources) && lesson.resources.length > 0 && (
        <Card title="Resources">
          <ul className="space-y-2">
            {lesson.resources.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {r.name}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
        <Button
          variant="danger"
          size="sm"
          icon={<HiTrash className="w-4 h-4" />}
          onClick={() => setConfirmDelete(true)}
        >
          Delete lesson
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete lesson"
        message={`Delete "${lesson?.title}"? The Cloudinary video will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}