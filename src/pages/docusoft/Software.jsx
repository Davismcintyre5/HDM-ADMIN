import { useEffect, useState } from 'react';
import { getSoftware, createSoftware, updateSoftware, deleteSoftware } from '../../services/docusoft/software';
import { getCategories } from '../../services/docusoft/categories';
import { getSettings } from '../../services/docusoft/settings';
import Card from '../../components/docusoft/ui/Card';
import Table from '../../components/docusoft/ui/Table';
import Badge from '../../components/docusoft/ui/Badge';
import Button from '../../components/docusoft/ui/Button';
import Modal from '../../components/docusoft/ui/Modal';
import Input from '../../components/docusoft/ui/Input';
import Toggle from '../../components/docusoft/ui/Toggle';
import ConfirmDialog from '../../components/docusoft/ui/ConfirmDialog';
import { formatDate } from '../../utils/docusoft/formatDate';
import { HiPencil, HiTrash, HiPlus, HiRefresh } from 'react-icons/hi';

export default function Software() {
  const [software, setSoftware] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, item: null });
  const [form, setForm] = useState({ title: '', description: '', category: '', isFree: false, price: 0, file: null, externalUrl: '' });
  const [uploadMethod, setUploadMethod] = useState('file');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getSoftware(), getCategories(), getSettings()])
      .then(([sw, cats, sett]) => {
        setSoftware(sw.data || sw || []);
        setCategories(cats.data || cats || []);
        setSettings(sett.data || sett || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const currency = settings?.currency || 'USD';
  const currencySymbol = settings?.currencySymbol || '$';

  const formatPrice = (price) => {
    if (currency === 'KES') return `${currencySymbol} ${price?.toLocaleString()}`;
    return `${currencySymbol}${price}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 500 * 1024 * 1024) { setError('File too large. Max size 500MB'); e.target.value = null; return; }
    setForm(p => ({ ...p, file })); setError('');
  };

  const openCreate = () => {
    setForm({ title: '', description: '', category: categories[0]?._id || '', isFree: false, price: 0, file: null, externalUrl: '' });
    setUploadMethod('file'); setError(''); setUploadProgress(0);
    setModal({ open: true, item: null });
  };

  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description || '', category: item.category?._id || item.category, isFree: item.isFree, price: item.price || 0, file: null, externalUrl: item.fileUrl || '' });
    setUploadMethod(item.fileUrl && !item.fileInfo ? 'url' : 'file'); setError(''); setUploadProgress(0);
    setModal({ open: true, item });
  };

  const validateForm = () => {
    if (!form.title.trim()) { setError('Title is required'); return false; }
    if (!form.category) { setError('Category is required'); return false; }
    if (!form.isFree && (!form.price || Number(form.price) <= 0)) { setError(`Price must be > 0 for paid items`); return false; }
    if (!modal.item) {
      if (uploadMethod === 'file' && !form.file) { setError('File is required'); return false; }
      if (uploadMethod === 'url' && !form.externalUrl.trim()) { setError('External URL is required'); return false; }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true); setError(''); setUploadProgress(0);
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description || '');
    formData.append('category', form.category);
    formData.append('isFree', form.isFree);
    formData.append('price', form.isFree ? 0 : Number(form.price));
    if (uploadMethod === 'file' && form.file) formData.append('file', form.file);
    else if (uploadMethod === 'url') formData.append('fileUrl', form.externalUrl.trim());
    try {
      if (modal.item) await updateSoftware(modal.item._id, formData);
      else await createSoftware(formData);
      setModal({ open: false, item: null }); fetchData();
    } catch (err) { setError(err?.response?.data?.message || err.message || 'Save failed'); }
    finally { setSaving(false); setUploadProgress(0); }
  };

  const handleDelete = async () => {
    try { await deleteSoftware(confirmDelete.id); setConfirmDelete({ open: false, id: null }); fetchData(); }
    catch (err) { alert(err.message); }
  };

  const total = software.length;
  const freeCount = software.filter(s => s.isFree).length;
  const totalDownloads = software.reduce((sum, s) => sum + (s.downloadCount || 0), 0);

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'category', label: 'Category', render: (row) => <Badge variant="purple">{row.category?.name || row.category || 'N/A'}</Badge> },
    { key: 'type', label: 'Type', render: (row) => row.fileUrl && !row.fileInfo ? <Badge>🔗 External</Badge> : <Badge variant="success">📦 Uploaded</Badge> },
    { key: 'price', label: 'Price', render: (row) => row.isFree ? <span className="text-green-600 font-semibold text-sm">FREE</span> : <span className="text-sm font-medium">{formatPrice(row.price)}</span> },
    { key: 'downloads', label: 'Downloads', render: (row) => row.downloadCount || 0 },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" onClick={() => openEdit(row)}><HiPencil className="w-4 h-4" /></Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: row._id })}><HiTrash className="w-4 h-4" /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Software</h1>
          <p className="text-sm text-[var(--text-muted)]">{total} items • {freeCount} free • {totalDownloads} downloads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><HiRefresh className="w-4 h-4" /></Button>
          <Button onClick={openCreate}><HiPlus className="w-4 h-4 mr-1" /> Add Software</Button>
        </div>
      </div>
      <Card><Table columns={columns} data={software} loading={loading} emptyMessage="No software." /></Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item ? 'Edit Software' : 'Add Software'} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div><div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden"><div className="h-full bg-purple-600 transition-all" style={{ width: `${uploadProgress}%` }} /></div><p className="text-xs text-[var(--text-muted)] mt-1">Uploading {uploadProgress}%</p></div>
          )}
          <Input label="Title *" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} disabled={saving} />
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y text-sm" disabled={saving} /></div>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category *</label><select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} disabled={saving} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 text-sm"><option value="">Select Category</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
          <Toggle label="Free" checked={form.isFree} onChange={(v) => setForm(p => ({ ...p, isFree: v, price: v ? 0 : p.price }))} />
          {!form.isFree && <Input label={`Price (${currencySymbol})`} type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} disabled={saving} />}
          {!modal.item && (
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Upload Method</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="uploadMethod" value="file" checked={uploadMethod === 'file'} onChange={() => setUploadMethod('file')} className="text-purple-600" /><span className="text-sm">Upload File</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="uploadMethod" value="url" checked={uploadMethod === 'url'} onChange={() => setUploadMethod('url')} className="text-purple-600" /><span className="text-sm">External URL</span></label></div></div>
          )}
          {uploadMethod === 'file' && (<div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">File {!modal.item && '*'}</label><input type="file" className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 dark:file:bg-purple-900/20 file:text-purple-700 dark:file:text-purple-400" onChange={handleFileChange} accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.zip,.rar,.7z" disabled={saving} /><p className="text-xs text-[var(--text-muted)] mt-1">Max 500MB</p></div>)}
          {uploadMethod === 'url' && (<Input label={`External URL ${!modal.item ? '*' : ''}`} type="url" value={form.externalUrl} onChange={(e) => setForm(p => ({ ...p, externalUrl: e.target.value }))} placeholder="https://..." disabled={saving} />)}
          <div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => setModal({ open: false, item: null })}>Cancel</Button><Button onClick={handleSave} loading={saving}>{saving ? 'Saving...' : modal.item ? 'Update' : 'Add'}</Button></div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} title="Delete Software" message="Delete this software? This cannot be undone." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} />
    </div>
  );
}