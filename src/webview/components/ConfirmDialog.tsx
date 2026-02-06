interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
      <span className="confirm-dialog__text">{message}</span>
      <button className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
        Cancel
      </button>
      <button className="confirm-dialog__btn confirm-dialog__btn--confirm" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );
}
