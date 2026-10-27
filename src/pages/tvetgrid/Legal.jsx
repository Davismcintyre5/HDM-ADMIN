import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiScale, HiArrowRight } from 'react-icons/hi';
import Card from '../../components/tvetgrid/ui/Card';
import Badge from '../../components/tvetgrid/ui/Badge';
import Button from '../../components/tvetgrid/ui/Button';
import Input from '../../components/tvetgrid/ui/Input';
import Modal from '../../components/tvetgrid/ui/Modal';
import Spinner from '../../components/tvetgrid/ui/Spinner';
import { useToast } from '../../context/tvetgrid/ToastContext';
import { getLegalDocs, createLegalDoc } from '../../services/tvetgrid/legal';
import { formatDate } from '../../utils/tvetgrid/formatDate';

export default function Legal() {
  const navigate = useNavigate();
  const toast = useToast();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');

  const load = () => {
    setLoading(true);
    getLegalDocs()
      .then((res) => {
        const data = res?.data || res;
        setDocs(Array.isArray(data) ? data : []);
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!slug.trim() || !title.trim()) {
      toast.error('Slug and title are required');
      return;
    }
    setCreating(true);
    try {
      await createLegalDoc({
        slug: slug.trim(),
        title: title.trim(),
        bodyMd: '# ' + title.trim(),
        isPublished: false,
      });
      toast.success('Legal doc created');
      setCreateOpen(false);
      setSlug('');
      setTitle('');
      navigate(`/tvetgrid/legal/${slug.trim()}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Legal
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {docs.length} document{docs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          icon={<HiPlus className="w-4 h-4" />}
          onClick={() => {
            setSlug('');
            setTitle('');
            setCreateOpen(true);
          }}
        >
          New document
        </Button>
      </div>

      {docs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HiScale className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              No legal documents yet
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((d) => (
            <Card key={d.slug}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[var(--text-primary)] truncate">
                      {d.title}
                    </h3>
                    <Badge variant={d.isPublished ? 'success' : 'default'} dot>
                      {d.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-muted)]">
                    /{d.slug} · v{d.version}
                  </p>
                  {d.updatedAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Updated {formatDate(d.updatedAt)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<HiArrowRight className="w-4 h-4" />}
                  onClick={() => navigate(`/tvetgrid/legal/${d.slug}`)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New legal document"
        size="sm"
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
            label="Slug *"
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
            }
            placeholder="terms"
            hint="Used in URLs and as a stable identifier"
          />
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Terms of Service"
          />
        </div>
      </Modal>
    </div>
  );
}