import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiSave,
  HiSparkles,
  HiTrash,
  HiExternalLink,
  HiPlus,
  HiX,
  HiLockClosed,
  HiDownload,
} from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Select from '../../components/tvetgrid/ui/Select';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import Modal from '../../components/tvetgrid/ui/Modal';
import ConfirmDialog from '../../components/tvetgrid/ui/ConfirmDialog';
import { useToast } from '../../context/tvetgrid/ToastContext';
import {
  getNote,
  updateNote,
  replaceNoteFiles,
  deleteNote,
  generateQuestions,
  requestUploadSignature,
  confirmUpload,
} from '../../services/tvetgrid/notes';
import {
  uploadToCloudinary,
  NOTE_ALLOWED_TYPES,
  NOTE_MAX_FILE_SIZE,
  NOTE_MAX_FILES,
} from '../../services/tvetgrid/upload';
import { formatDate } from '../../utils/tvetgrid/formatDate';
import { NOTE_VISIBILITY_LIST } from '../../utils/tvetgrid/constants';

const ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.webp,.docx,application/pdf,image/png,image/jpeg,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fileIcon(mime) {
  if (!mime) return '📄';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.includes('pdf')) return '📕';
  if (mime.includes('word')) return '📘';
  return '📄';
}

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [files, setFiles] = useState([]);
  const [filesDirty, setFilesDirty] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [genOpen, setGenOpen] = useState(false);
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNote(id);
      const n = res?.data || res;
      setNote(n);
      setTitle(n.title || '');
      setDescription(n.description || '');
      setVisibility(n.visibility || 'public');
      setFiles(n.files || []);
      setFilesDirty(false);
    } catch (err) {
      toast.error(err.message || 'Failed to load note');
      navigate('/tvetgrid/notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      await updateNote(id, {
        title: title.trim(),
        description: description.trim(),
        visibility,
      });

      if (filesDirty) {
        await replaceNoteFiles(id, files);
      }

      toast.success('Note saved');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFiles = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length === 0) return;

    if (files.length + picked.length > NOTE_MAX_FILES) {
      toast.error(`Max ${NOTE_MAX_FILES} files per note`);
      return;
    }

    for (const file of picked) {
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

        const rec = {
          publicId: confirmed.publicId || cloudRes.public_id,
          url: confirmed.url || cloudRes.secure_url,
          fileName: file.name,
          size: confirmed.bytes || cloudRes.bytes,
          mimeType: file.type,
          resourceType: confirmed.resourceType || cloudRes.resource_type || 'auto',
        };

        setFiles((prev) => [...prev, rec]);
        setFilesDirty(true);
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
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFilesDirty(true);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateQuestions(id, genCount);
      const data = res?.data || res;
      toast.success(
        data?.jobId
          ? `Question generation queued (job ${data.jobId})`
          : 'Question generation queued'
      );
      setGenOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to queue');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNote(id);
      toast.success('Note deleted');
      navigate('/tvetgrid/notes');
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

  if (!note) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/notes')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {note.title}
          </h1>
          {note.createdAt && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Created {formatDate(note.createdAt, 'full')}
            </p>
          )}
        </div>
        <Badge variant={note.visibility === 'public' ? 'info' : 'default'}>
          {note.visibility || 'public'}
        </Badge>
      </div>

      <Card title="Details">
        <div className="space-y-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            hint="Optional short description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Course
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)]">
                <HiLockClosed className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="truncate">
                  {note.courseId?.title || '—'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Subject
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)]">
                <HiLockClosed className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="truncate">
                  {note.subjectId?.name || '—'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Course and subject cannot be changed after creation.
          </p>

          <Select
            label="Visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            options={NOTE_VISIBILITY_LIST}
          />
        </div>
      </Card>

      <Card
        title={`Files (${files.length}/${NOTE_MAX_FILES})`}
        actions={
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm cursor-pointer hover:bg-[var(--bg-secondary)] ${
              files.length >= NOTE_MAX_FILES || uploading
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
              onChange={handleAddFiles}
              className="hidden"
              disabled={files.length >= NOTE_MAX_FILES || uploading}
            />
          </label>
        }
        padding={false}
      >
        {files.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-8 text-center">
            No files yet. Add at least one.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-color)]">
            {files.map((f, i) => (
              <li
                key={f.publicId || i}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl shrink-0">{fileIcon(f.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {f.fileName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatBytes(f.size)} · {f.mimeType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                    title="Open"
                  >
                    <HiExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={f.url}
                    download={f.fileName}
                    className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                    title="Download"
                  >
                    <HiDownload className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    title="Remove"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {Object.entries(uploadProgress).map(([id2, pct]) => (
          <div key={id2} className="px-4 py-2">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span className="truncate">
                {id2.split('-').slice(1).join('-')}
              </span>
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
      </Card>

      <div className="flex justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
        <Button
          variant="secondary"
          icon={<HiSparkles className="w-4 h-4" />}
          onClick={() => setGenOpen(true)}
        >
          Generate questions
        </Button>
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            icon={<HiTrash className="w-4 h-4" />}
            onClick={() => setConfirmDelete(true)}
          >
            Delete note
          </Button>
          <Button
            icon={<HiSave className="w-4 h-4" />}
            onClick={handleSave}
            loading={saving}
            disabled={uploading}
          >
            Save changes
          </Button>
        </div>
      </div>

      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate questions"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              loading={generating}
              icon={<HiSparkles className="w-4 h-4" />}
            >
              Queue generation
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Use AI to generate multiple-choice questions from this note's files.
          The job runs in the background — review the generated questions and
          add them to a paper afterwards.
        </p>
        <Input
          label="Number of questions"
          type="number"
          min="1"
          max="20"
          value={genCount}
          onChange={(e) => setGenCount(Number(e.target.value))}
          hint="Between 1 and 20"
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete note"
        message={`Delete "${note.title}"? All ${files.length} file(s) will also be removed from Cloudinary. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}