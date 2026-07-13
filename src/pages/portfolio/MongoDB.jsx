import { useState, useEffect } from 'react';
import { getMongoStats, getMongoDatabases, getMongoDatabase, getMongoCollection, queryMongoCollection, dropMongoCollection, dropMongoDatabase } from '../../services/portfolio/mongodb';
import Card from '../../components/portfolio/ui/Card';
import Badge from '../../components/portfolio/ui/Badge';
import Button from '../../components/portfolio/ui/Button';
import Input from '../../components/portfolio/ui/Input';
import ConfirmDialog from '../../components/portfolio/ui/ConfirmDialog';
import Spinner from '../../components/portfolio/ui/Spinner';
import { HiDatabase, HiCollection, HiTrash, HiSearch } from 'react-icons/hi';

export default function MongoDB() {
  const [stats, setStats] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCol, setSelectedCol] = useState('');
  const [documents, setDocuments] = useState([]);
  const [colStats, setColStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', db: '', col: '' });
  const [queryFilter, setQueryFilter] = useState('{}');

  const fetchStats = () => {
    getMongoStats()
      .then(res => setStats(res?.data || res || {}))
      .catch(console.error);
  };

  const fetchDatabases = () => {
    setLoading(true);
    getMongoDatabases()
      .then(res => setDatabases(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); fetchDatabases(); }, []);

  const selectDatabase = (db) => {
    setSelectedDb(db);
    setSelectedCol('');
    setDocuments([]);
    setColStats(null);
    setLoading(true);
    getMongoDatabase(db)
      .then(res => setCollections(res?.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const selectCollection = (col) => {
    setSelectedCol(col);
    setLoading(true);
    Promise.all([
      getMongoCollection(selectedDb, col).catch(() => ({ stats: {}, indexes: [], sampleDocuments: [] })),
      queryMongoCollection(selectedDb, col, { filter: queryFilter, limit: 50 }).catch(() => ({ documents: [] })),
    ]).then(([colRes, queryRes]) => {
      setColStats(colRes?.data || colRes || {});
      setDocuments(queryRes?.data?.documents || queryRes?.documents || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleQuery = () => {
    if (!selectedCol) return;
    setLoading(true);
    queryMongoCollection(selectedDb, selectedCol, { filter: queryFilter, limit: 50 })
      .then(res => setDocuments(res?.data?.documents || res?.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDropCol = async () => {
    setActionLoading(true);
    try { await dropMongoCollection(deleteConfirm.db, deleteConfirm.col); setDeleteConfirm({ open: false, type: '', db: '', col: '' }); setSelectedCol(''); selectDatabase(selectedDb); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  const handleDropDb = async () => {
    setActionLoading(true);
    try { await dropMongoDatabase(deleteConfirm.db); setDeleteConfirm({ open: false, type: '', db: '', col: '' }); setSelectedDb(''); setSelectedCol(''); setCollections([]); fetchDatabases(); }
    catch (e) { alert(e.message); }
    setActionLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatUptime = (hours) => {
    if (!hours) return '—';
    const d = Math.floor(hours / 24);
    const h = Math.floor(hours % 24);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  };

  if (loading && !databases.length) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">🗄️ MongoDB Atlas Management</h1>

      {/* Cluster Stats */}
 {stats && (
  <>
    {/* Storage Bar */}
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[var(--text-secondary)]">Storage</p>
        <p className="text-xs text-[var(--text-muted)]">
          {formatSize(stats.storage?.dataSize)} / 512 MB
          {' '}({stats.storage?.dataSize ? ((stats.storage.dataSize / (512 * 1024 * 1024)) * 100).toFixed(2) : 0}%)
        </p>
      </div>
      <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
        <div
          className="bg-green-600 h-3 rounded-full"
          style={{ width: `${Math.min(((stats.storage?.dataSize || 0) / (512 * 1024 * 1024)) * 100, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[var(--text-muted)]">
          Tier: <span className="font-medium text-[var(--text-primary)]">{stats.tier || 'M0 (Free)'}</span>
        </p>
        {stats.host && <p className="text-xs text-[var(--text-muted)] truncate ml-4 max-w-[300px]">{stats.host}</p>}
      </div>
    </Card>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Version</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{stats.version || '—'}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Uptime</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{formatUptime(stats.uptime)}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Connections</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{stats.connections?.current || 0}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Documents</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{stats.storage?.objects || 0}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Collections</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{stats.storage?.collections || 0}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Data Size</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{formatSize(stats.storage?.dataSize)}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Storage Size</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{formatSize(stats.storage?.storageSize)}</p>
      </Card>
      <Card>
        <p className="text-xs text-[var(--text-muted)]">Index Size</p>
        <p className="text-lg font-bold text-[var(--text-primary)]">{formatSize(stats.storage?.indexSize)}</p>
      </Card>
    </div>
  </>
)}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Databases */}
        <Card>
          <h3 className="font-medium text-[var(--text-primary)] mb-3">Databases</h3>
          <div className="space-y-1">
            {databases.map(db => (
              <div key={db.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
                <button onClick={() => selectDatabase(db.name)} className={`text-sm font-medium ${selectedDb === db.name ? 'text-green-600' : 'text-[var(--text-primary)]'}`}>
                  📊 {db.name}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">{db.collections || 0} colls</span>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ open: true, type: 'db', db: db.name, col: '' })}><HiTrash className="w-3 h-3 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Collections */}
        <Card>
          <h3 className="font-medium text-[var(--text-primary)] mb-3">
            {selectedDb ? `${selectedDb} › Collections` : 'Select a database'}
          </h3>
          {selectedDb && (
            <div className="space-y-1">
              {collections.map(col => (
                <div key={col.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-secondary)]">
                  <button onClick={() => selectCollection(col.name)} className={`text-sm ${selectedCol === col.name ? 'text-green-600 font-medium' : 'text-[var(--text-primary)]'}`}>
                    📁 {col.name}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">{col.documentCount || 0} docs</span>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ open: true, type: 'col', db: selectedDb, col: col.name })}><HiTrash className="w-3 h-3 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Documents */}
        <Card>
          <h3 className="font-medium text-[var(--text-primary)] mb-3">
            {selectedCol ? `${selectedCol} › Documents` : 'Select a collection'}
          </h3>
          {selectedCol && (
            <>
              {colStats?.stats && (
                <div className="flex gap-3 mb-3 text-xs text-[var(--text-muted)]">
                  <span>Docs: {colStats.stats.documentCount || 0}</span>
                  <span>Size: {formatSize(colStats.stats.size)}</span>
                  <span>Indexes: {colStats.indexes?.length || 0}</span>
                </div>
              )}
              <div className="flex gap-2 mb-3">
                <Input value={queryFilter} onChange={e => setQueryFilter(e.target.value)} placeholder='{"key": "value"}' className="text-xs" />
                <Button size="sm" onClick={handleQuery}><HiSearch className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.map((doc, i) => (
                  <div key={doc._id || i} className="bg-[var(--bg-tertiary)] rounded p-2 text-xs font-mono text-[var(--text-primary)] overflow-x-auto">
                    {JSON.stringify(doc, null, 1).slice(0, 500)}
                  </div>
                ))}
                {documents.length === 0 && <p className="text-xs text-[var(--text-muted)] py-4 text-center">No documents</p>}
              </div>
            </>
          )}
        </Card>
      </div>

      <ConfirmDialog open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: '', db: '', col: '' })}
        onConfirm={deleteConfirm.type === 'db' ? handleDropDb : handleDropCol}
        title={deleteConfirm.type === 'db' ? 'Drop Database' : 'Drop Collection'}
        message={`Are you sure you want to drop ${deleteConfirm.type === 'db' ? deleteConfirm.db : `${deleteConfirm.col} in ${deleteConfirm.db}`}? This cannot be undone.`}
        confirmLabel="Drop" variant="danger" loading={actionLoading} />
    </div>
  );
}