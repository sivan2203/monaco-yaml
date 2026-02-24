interface CloseWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Предупреждает, что закрытие недоступно, пока не устранены backend-ошибки сохранения.
 */
export function CloseWarningModal({ isOpen, onClose }: CloseWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="yce-status-overlay" onClick={onClose}>
      <div className="yce-status-content" onClick={(event) => event.stopPropagation()}>
        <div className="yce-status-title">Есть нерешённые ошибки</div>
        <div className="yce-status-message">
          Вы пытаетесь закрыть окно, но есть backend-ошибки после сохранения. Исправьте ошибки и
          повторите сохранение.
        </div>
        <div className="yce-status-footer">
          <button className="yce-status-btn-primary" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
