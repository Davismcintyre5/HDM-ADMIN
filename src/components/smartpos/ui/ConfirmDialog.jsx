import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-[var(--text-secondary)] mb-6 whitespace-pre-line">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}