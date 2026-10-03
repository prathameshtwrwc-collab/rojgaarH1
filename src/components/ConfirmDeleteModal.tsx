import { useState } from 'react';
import { Modal, Button } from './ui';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** Runs the delete. Throw to show the message in the dialog. */
  onConfirm: () => Promise<void>;
}

/** Asks before a permanent delete, shows the database's reason if it is refused. */
export default function ConfirmDeleteModal({ isOpen, onClose, title, description, confirmLabel, onConfirm }: ConfirmDeleteModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-[var(--charcoal)] leading-relaxed">{description}</p>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 break-words">{error}</p>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
