import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiDocumentText, HiPlus, HiRefresh } from 'react-icons/hi';
import Card from '../../components/pharmasys/ui/Card';
import Badge from '../../components/pharmasys/ui/Badge';
import Button from '../../components/pharmasys/ui/Button';
import Spinner from '../../components/pharmasys/ui/Spinner';
import Modal from '../../components/pharmasys/ui/Modal';
import { useToast } from '../../context/pharmasys/ToastContext';
import {
  getLegalList,
  setCurrentLegal,
} from '../../services/pharmasys/legal';
import { formatDate } from '../../utils/pharmasys/formatDate';
import { LEGAL_TYPES, statusLabel } from '../../utils/pharmasys/constants';

export default function Legal() {
  const navigate = useNavigate();
  const toast = useToast();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLegalList();
      const data = res?.data || res;
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doRollback = async () => {
    if (!rollbackTarget) return;
    setBusy(true);
    try {
      await setCurrentLegal(rollbackTarget._id || rollbackTarget.id);
      toast.success('Version set as current');
      setRollbackTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to rollback');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Group docs by type, sort by version desc
  const byType = {};
  LEGAL_TYPES.forEach((t) => {
    byType[t] = docs
      .filter((d) => d.type === t)
      .sort((a, b) => (b.version || 0) - (a.version || 0));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Legal documents
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Versioned policies. Published versions are immutable.
          </p>
        </div>
        <Button
          variant="outline"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEGAL_TYPES.map((type) => {
          const versions = byType[type] || [];
          const current = versions.find((v) => v.isCurrent);
          const older = versions.filter((v) => !v.isCurrent);

          return (
            <Card key={type} title={type.toUpperCase()}>
              <div className="space-y-4">
                {current ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" dot>
                        Published
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        v{current.version}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {current.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Effective{' '}
                      {current.effectiveAt
                        ? formatDate(current.effectiveAt)
                        : current.publishedAt
                        ? formatDate(current.publishedAt)
                        : '—'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="default">Not published</Badge>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      No current version
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<HiDocumentText className="w-4 h-4" />}
                    onClick={() => navigate(`/pharmasys/legal/${type}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    icon={<HiPlus className="w-4 h-4" />}
                    onClick={() => navigate(`/pharmasys/legal/${type}`)}
                  >
                    New version
                  </Button>
                </div>

                {older.length > 0 && (
                  <details className="pt-2">
                    <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">
                      {older.length} previous version
                      {older.length !== 1 ? 's' : ''}
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {older.map((v) => (
                        <li
                          key={v._id || v.id}
                          className="flex items-center justify-between gap-3 text-xs py-2 border-t border-[var(--border-color)]"
                        >
                          <div>
                            <span className="text-[var(--text-primary)]">
                              v{v.version}
                            </span>
                            <span className="text-[var(--text-muted)] ml-2">
                              {v.publishedAt
                                ? formatDate(v.publishedAt)
                                : formatDate(v.createdAt)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRollbackTarget(v)}
                          >
                            Set current
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!rollbackTarget}
        onClose={() => setRollbackTarget(null)}
        title="Set version as current"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRollbackTarget(null)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={doRollback} loading={busy}>
              Set current
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Set <strong>v{rollbackTarget?.version}</strong> of{' '}
          <strong>{rollbackTarget?.type}</strong> as the current published
          version? The current version will be archived.
        </p>
      </Modal>
    </div>
  );
}