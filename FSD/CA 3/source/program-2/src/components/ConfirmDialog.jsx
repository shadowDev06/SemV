import { useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ expense, onCancel, onConfirm }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onCancel();
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <button className="modal-close icon-button" onClick={onCancel} aria-label="Close dialog"><X size={20} /></button>
        <span className="danger-icon"><AlertTriangle size={25} /></span>
        <h2 id="delete-title">Delete this expense?</h2>
        <p><strong>{expense.title}</strong> will be permanently removed from your records. This action can’t be undone.</p>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onCancel}>Keep expense</button>
          <button className="button button-danger" onClick={onConfirm}><Trash2 size={17} /> Delete expense</button>
        </div>
      </div>
    </div>
  );
}
