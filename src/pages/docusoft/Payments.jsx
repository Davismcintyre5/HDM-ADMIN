import { useEffect, useState } from 'react';
import { getPendingPayments, approvePayment, rejectPayment } from '../../services/docusoft/payments';
import Card from '../../components/docusoft/ui/Card';
import Button from '../../components/docusoft/ui/Button';
import Modal from '../../components/docusoft/ui/Modal';
import Spinner from '../../components/docusoft/ui/Spinner';
import { formatDate } from '../../utils/docusoft/formatDate';
import { HiCheck, HiX, HiRefresh, HiPhotograph, HiChat } from 'react-icons/hi';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });

  const fetchPayments = () => {
    setLoading(true);
    getPendingPayments()
      .then(res => setPayments(res.data || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this payment? Order will be created automatically.')) return;
    setProcessingId(id);
    try {
      await approvePayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reason) => {
    setProcessingId(rejectModal.id);
    try {
      await rejectPayment(rejectModal.id, reason);
      setRejectModal({ open: false, id: null });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_DOCUSOFT_API || 'http://localhost:5000';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (payments.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pending Payments</h1>
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No pending payments</h3>
          <p className="text-[var(--text-muted)] mb-4">All manual payments have been processed.</p>
          <Button variant="outline" onClick={fetchPayments}><HiRefresh className="w-4 h-4 mr-1" /> Refresh</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pending Payments</h1>
          <p className="text-sm text-[var(--text-muted)]">{payments.length} payment{payments.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments}><HiRefresh className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Item</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Evidence</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {payments.map(payment => {
                const hasScreenshot = !!payment.screenshotUrl;
                const hasMessage = payment.metadata?.paymentConfirmation || payment.paymentConfirmation;
                const imageUrl = getImageUrl(payment.screenshotUrl);

                return (
                  <tr key={payment._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{payment.user?.name || payment.userId?.name || 'Unknown'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{payment.user?.email || payment.userId?.email}</div>
                      <div className="text-xs text-[var(--text-muted)]">{payment.user?.phone || payment.userId?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{payment.itemTitle || payment.itemId?.title || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">{payment.itemType}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                      ${payment.amount || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                      {formatDate(payment.createdAt, 'full')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {hasScreenshot && (
                          <button
                            onClick={() => setViewImage(imageUrl)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200 transition"
                          >
                            <HiPhotograph className="w-3.5 h-3.5" /> View Screenshot
                          </button>
                        )}
                        {hasMessage && (
                          <div className="max-w-[200px]">
                            <div className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
                              <HiChat className="w-3 h-3" /> Confirmation:
                            </div>
                            <div className="text-xs bg-[var(--bg-tertiary)] p-2 rounded break-words max-h-20 overflow-y-auto">
                              {hasMessage}
                            </div>
                          </div>
                        )}
                        {!hasScreenshot && !hasMessage && (
                          <span className="text-xs text-[var(--text-muted)]">No evidence</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(payment._id)}
                          loading={processingId === payment._id}
                        >
                          <HiCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRejectModal({ open: true, id: payment._id })}
                          disabled={processingId === payment._id}
                        >
                          <HiX className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Image Viewer Modal */}
      <Modal open={!!viewImage} onClose={() => setViewImage(null)} title="Payment Screenshot" size="lg">
        {viewImage && (
          <div className="flex justify-center">
            <img src={viewImage} alt="Payment screenshot" className="max-w-full max-h-[70vh] rounded-lg" />
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null })} title="Reject Payment" size="sm">
        <RejectForm onSubmit={handleReject} onCancel={() => setRejectModal({ open: false, id: null })} loading={!!processingId} />
      </Modal>
    </div>
  );
}

function RejectForm({ onSubmit, onCancel, loading }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason for rejection (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-2 focus:ring-purple-500 resize-y text-sm"
          placeholder="e.g., Payment not received"
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" type="submit" loading={loading}>Reject</Button>
      </div>
    </form>
  );
}