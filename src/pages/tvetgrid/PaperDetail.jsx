import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiSave,
  HiPlus,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiLockClosed,
  HiExternalLink,
  HiX,
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
  getPaper,
  updatePaper,
  updatePaperQuestions,
  replacePaperPdf,
  deletePaper,
  requestUploadSignature,
  confirmUpload,
} from '../../services/tvetgrid/papers';
import {
  uploadToCloudinary,
  PAPER_MAX_FILE_SIZE,
  PAPER_ALLOWED_TYPES,
} from '../../services/tvetgrid/upload';
import { formatDate } from '../../utils/tvetgrid/formatDate';
import { DIFFICULTY } from '../../utils/tvetgrid/constants';

const EMPTY_Q = {
  qid: '',
  order: 0,
  stem: '',
  options: ['', '', '', ''],
  answer: '',
  solution: '',
  subjectId: '',
  difficulty: 'medium',
  linkedLessonId: '',
  linkedVideoTs: null,
  marks: 1,
};

const ACCEPT = '.pdf,application/pdf';

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [year, setYear] = useState('');
  const [paperNo, setPaperNo] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [sourcePdf, setSourcePdf] = useState(null);
  const [pdfDirty, setPdfDirty] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfPct, setPdfPct] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [qModal, setQModal] = useState({ open: false, mode: 'create', index: -1 });
  const [qForm, setQForm] = useState(EMPTY_Q);
  const [savingQ, setSavingQ] = useState(false);
  const [confirmDeleteQ, setConfirmDeleteQ] = useState({ open: false, index: -1 });

  const [confirmDeletePaper, setConfirmDeletePaper] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPaper(id);
      const p = res?.data || res;
      setPaper(p);
      setYear(p.year || '');
      setPaperNo(p.paperNo || '');
      setDurationMin(p.durationMin || '');
      setIsPublished(!!p.isPublished);
      setQuestions(Array.isArray(p.questions) ? p.questions : []);
      setSourcePdf(p.sourcePdf || null);
      setPdfDirty(false);
    } catch (err) {
      toast.error(err.message || 'Failed to load paper');
      navigate('/tvetgrid/papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSavePaper = async () => {
    setSaving(true);
    try {
      const res = await updatePaper(id, {
        year: year ? Number(year) : undefined,
        paperNo: paperNo ? Number(paperNo) : undefined,
        durationMin: durationMin ? Number(durationMin) : undefined,
        isPublished,
      });
      const updated = res?.data || res;
      if (updated) setPaper((prev) => ({ ...prev, ...updated }));

      if (pdfDirty && sourcePdf?.url) {
        const pdfRes = await replacePaperPdf(id, {
          publicId: sourcePdf.publicId,
          url: sourcePdf.url,
          fileName: sourcePdf.fileName || null,
          size: sourcePdf.size || null,
          mimeType: sourcePdf.mimeType || 'application/pdf',
        });
        const pdfUpdated = pdfRes?.data || pdfRes;
        if (pdfUpdated) setPaper((prev) => ({ ...prev, ...pdfUpdated }));
        setPdfDirty(false);
      }

      toast.success('Paper saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePickPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > PAPER_MAX_FILE_SIZE) {
      toast.error(`Max ${formatBytes(PAPER_MAX_FILE_SIZE)}`);
      return;
    }
    if (!PAPER_ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF files allowed');
      return;
    }

    setUploadingPdf(true);
    setPdfPct(0);
    try {
      const sigRes = await requestUploadSignature({});
      const sig = sigRes?.data || sigRes;

      const cloud = await uploadToCloudinary(file, sig, setPdfPct);

      const confirmRes = await confirmUpload({
        publicId: cloud.public_id,
        resourceType: cloud.resource_type || 'raw',
      });
      const confirmed = confirmRes?.data || confirmRes;

      setSourcePdf({
        publicId: confirmed.publicId || cloud.public_id,
        url: confirmed.url || cloud.secure_url,
        fileName: file.name,
        size: confirmed.bytes || cloud.bytes,
        mimeType: confirmed.mimeType || file.type || 'application/pdf',
      });
      setPdfDirty(true);
      toast.success('New PDF ready — click Save details to apply');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingPdf(false);
      setPdfPct(null);
    }
  };

  const handleSaveQuestions = async (nextQuestions) => {
    try {
      const res = await updatePaperQuestions(id, nextQuestions);
      const updated = res?.data || res;
      if (updated) setPaper((prev) => ({ ...prev, ...updated }));
      toast.success('Questions saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save questions');
      throw err;
    }
  };

  const openCreateQ = () => {
    setQForm({ ...EMPTY_Q, order: questions.length + 1 });
    setQModal({ open: true, mode: 'create', index: -1 });
  };

  const openEditQ = (index) => {
    const q = questions[index];
    setQForm({
      ...EMPTY_Q,
      ...q,
      options: [...(q.options || ['', '', '', ''])].slice(0, 4),
      subjectId: q.subjectId || '',
    });
    setQModal({ open: true, mode: 'edit', index });
  };

  const patchQ = (key, value) => setQForm((prev) => ({ ...prev, [key]: value }));
  const patchOption = (i, value) => {
    const next = [...qForm.options];
    next[i] = value;
    setQForm({ ...qForm, options: next });
  };

  const handleSaveQ = async () => {
    if (!qForm.stem.trim()) return toast.error('Question text is required');
    if (!qForm.answer.trim()) return toast.error('Answer is required');
    setSavingQ(true);
    try {
      const nextQ = {
        qid: qForm.qid || `q${Date.now()}`,
        order: Number(qForm.order) || questions.length + 1,
        stem: qForm.stem.trim(),
        options: qForm.options.filter((o) => o.trim()),
        answer: qForm.answer.trim(),
        solution: qForm.solution.trim() || undefined,
        subjectId: qForm.subjectId || undefined,
        difficulty: qForm.difficulty,
        marks: Number(qForm.marks) || 1,
      };

      const list = [...questions];
      if (qModal.mode === 'create') list.push(nextQ);
      else list[qModal.index] = nextQ;

      await handleSaveQuestions(list);
      setQuestions(list);
      setQModal({ open: false, mode: 'create', index: -1 });
    } catch {
      /* toast already shown */
    } finally {
      setSavingQ(false);
    }
  };

  const handleDeleteQ = async () => {
    const list = questions.filter((_, i) => i !== confirmDeleteQ.index);
    try {
      await handleSaveQuestions(list);
      setQuestions(list);
      setConfirmDeleteQ({ open: false, index: -1 });
    } catch {
      /* toast already shown */
    }
  };

  const moveQ = async (index, dir) => {
    const swap = index + dir;
    if (swap < 0 || swap >= questions.length) return;
    const list = [...questions];
    [list[index], list[swap]] = [list[swap], list[index]];
    list.forEach((q, i) => (q.order = i + 1));
    try {
      await handleSaveQuestions(list);
      setQuestions(list);
    } catch {
      /* toast already shown */
    }
  };

  const handleDeletePaper = async () => {
    setDeleting(true);
    try {
      await deletePaper(id);
      toast.success('Paper deleted');
      navigate('/tvetgrid/papers');
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

  if (!paper) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/tvetgrid/papers')}
        >
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {year} {paperNo ? `· Paper ${paperNo}` : ''}
          </h1>
          {paper.createdAt && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Created {formatDate(paper.createdAt, 'full')}
            </p>
          )}
        </div>
        <Badge variant={isPublished ? 'success' : 'default'} dot>
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <Card title="Paper details">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Course
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)]">
                <HiLockClosed className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="truncate">
                  {paper.courseId?.title || '—'}
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
                  {paper.subjectId?.name || '—'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Course and subject cannot be changed after creation.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Input
              label="Paper number"
              type="number"
              value={paperNo}
              onChange={(e) => setPaperNo(e.target.value)}
            />
            <Input
              label="Duration (min)"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
            />
            <Input
              label="Total marks"
              value={paper.totalMarks ?? 0}
              disabled
              hint="Auto-computed"
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
              onClick={handleSavePaper}
              loading={saving}
              disabled={uploadingPdf}
            >
              Save details
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Source PDF"
        actions={
          sourcePdf ? (
            <div className="flex items-center gap-1">
              <a
                href={sourcePdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]"
                title="Open"
              >
                <HiExternalLink className="w-4 h-4" />
              </a>
              <label
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm cursor-pointer hover:bg-[var(--bg-secondary)] ${
                  uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <HiX className="w-4 h-4 rotate-45" />
                Replace
                <input
                  type="file"
                  accept={ACCEPT}
                  onChange={handlePickPdf}
                  className="hidden"
                  disabled={uploadingPdf}
                />
              </label>
            </div>
          ) : (
            <label
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm cursor-pointer hover:bg-[var(--bg-secondary)] ${
                uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <HiPlus className="w-4 h-4" />
              Upload PDF
              <input
                type="file"
                accept={ACCEPT}
                onChange={handlePickPdf}
                className="hidden"
                disabled={uploadingPdf}
              />
            </label>
          )
        }
        padding={false}
      >
        <div className="px-4 py-3">
          {!sourcePdf ? (
            <p className="text-sm text-[var(--text-muted)] py-4">
              No PDF attached.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {sourcePdf.fileName || 'source.pdf'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatBytes(sourcePdf.size)} · {sourcePdf.mimeType || 'application/pdf'}
                  {pdfDirty && ' · unsaved'}
                </p>
              </div>
            </div>
          )}
          {pdfPct !== null && (
            <div className="mt-2">
              <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${pdfPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card
        title={`Questions (${questions.length})`}
        actions={
          <Button size="sm" icon={<HiPlus className="w-4 h-4" />} onClick={openCreateQ}>
            Add question
          </Button>
        }
        padding={false}
      >
        {questions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-12 text-center">
            No questions yet. Add the first one.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-color)]">
            {questions.map((q, i) => (
              <li key={q.qid || i} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        Q{i + 1}
                      </span>
                      <Badge variant="info">{q.difficulty || 'medium'}</Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        {q.marks || 1} mark{(q.marks || 1) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                      {q.stem}
                    </p>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                      {(q.options || []).map((opt, j) => (
                        <li
                          key={j}
                          className={
                            opt === q.answer
                              ? 'text-green-600 dark:text-green-400 font-medium'
                              : ''
                          }
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => moveQ(i, -1)} disabled={i === 0}>
                      <HiChevronUp className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveQ(i, 1)} disabled={i === questions.length - 1}>
                      <HiChevronDown className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openEditQ(i)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmDeleteQ({ open: true, index: i })}>
                      <HiTrash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
        <Button
          variant="danger"
          size="sm"
          icon={<HiTrash className="w-4 h-4" />}
          onClick={() => setConfirmDeletePaper(true)}
        >
          Delete paper
        </Button>
      </div>

      <Modal
        open={qModal.open}
        onClose={() => setQModal({ open: false, mode: 'create', index: -1 })}
        title={qModal.mode === 'create' ? 'Add question' : 'Edit question'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setQModal({ open: false, mode: 'create', index: -1 })}>
              Cancel
            </Button>
            <Button onClick={handleSaveQ} loading={savingQ}>
              Save question
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Question text *
            </label>
            <textarea
              value={qForm.stem}
              onChange={(e) => patchQ('stem', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
              placeholder="What is the SI unit of voltage?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Options
            </label>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Input
                  key={i}
                  value={qForm.options[i] || ''}
                  onChange={(e) => patchOption(i, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
              ))}
            </div>
          </div>
          <Input
            label="Answer *"
            value={qForm.answer}
            onChange={(e) => patchQ('answer', e.target.value)}
            hint="Must match one of the options exactly"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Solution (optional)
            </label>
            <textarea
              value={qForm.solution}
              onChange={(e) => patchQ('solution', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
            />
          </div>
          <Select
            label="Subject override (optional)"
            value={qForm.subjectId || ''}
            onChange={(e) => patchQ('subjectId', e.target.value)}
            options={[
              { value: '', label: 'Inherit from paper' },
              ...(paper.subjectId
                ? [{ value: paper.subjectId._id || paper.subjectId, label: paper.subjectId.name || 'Subject' }]
                : []),
            ]}
            hint="Rarely needed — leaves the question tied to the paper's subject by default."
          />
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Difficulty"
              value={qForm.difficulty}
              onChange={(e) => patchQ('difficulty', e.target.value)}
              options={DIFFICULTY}
            />
            <Input
              label="Marks"
              type="number"
              min="1"
              value={qForm.marks}
              onChange={(e) => patchQ('marks', e.target.value)}
            />
            <Input
              label="Order"
              type="number"
              value={qForm.order}
              onChange={(e) => patchQ('order', e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteQ.open}
        onClose={() => setConfirmDeleteQ({ open: false, index: -1 })}
        onConfirm={handleDeleteQ}
        title="Delete question"
        message="Delete this question from the paper?"
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={confirmDeletePaper}
        onClose={() => setConfirmDeletePaper(false)}
        onConfirm={handleDeletePaper}
        title="Delete paper"
        message={`Delete this ${paper.year} paper? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}