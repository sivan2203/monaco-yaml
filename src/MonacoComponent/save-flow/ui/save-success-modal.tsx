interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Показывает подтверждение, что все обновления блоков завершились успешно.
 */
export function SaveSuccessModal({ isOpen, onClose }: SaveSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="yce-status-overlay" onClick={onClose}>
      <div className="yce-status-content" onClick={(event) => event.stopPropagation()}>
        <div className="yce-status-title">Успешно обновлено</div>
        <div className="yce-status-message">
          Все изменённые блоки были успешно отправлены на backend.
        </div>
        <div className="yce-status-footer">
          <button className="yce-status-btn-primary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
