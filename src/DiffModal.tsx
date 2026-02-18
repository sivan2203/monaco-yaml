import { useRef, useEffect, useCallback } from "react";
import { monaco, getMonacoTheme, type Theme } from "./MonacoComponent";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalYaml: string;
  currentYaml: string;
  theme?: Theme;
}

export function DiffModal({
  isOpen,
  onClose,
  onConfirm,
  originalYaml,
  currentYaml,
  theme = "dark",
}: DiffModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diffEditorRef = useRef<monaco.editor.IDiffEditor | null>(null);

  const monacoTheme = getMonacoTheme(theme);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const originalModel = monaco.editor.createModel(originalYaml, "yaml");
    const modifiedModel = monaco.editor.createModel(currentYaml, "yaml");

    const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
      readOnly: true,
      originalEditable: false,
      automaticLayout: true,
      renderSideBySide: true,
      enableSplitViewResizing: true,
      theme: monacoTheme,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 8 },
    });

    diffEditor.setModel({ original: originalModel, modified: modifiedModel });
    diffEditorRef.current = diffEditor;

    return () => {
      diffEditor.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
      diffEditorRef.current = null;
    };
  }, [isOpen, originalYaml, currentYaml, monacoTheme]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="diff-modal-overlay" onClick={handleOverlayClick}>
      <div className="diff-modal-content">
        <div className="diff-modal-header">
          <span className="diff-modal-title">Подтверждение изменений</span>
          <div className="diff-modal-labels">
            <span className="diff-label diff-label-original">Исходный</span>
            <span className="diff-label diff-label-modified">Текущий</span>
          </div>
        </div>
        <div className="diff-modal-body" ref={containerRef} />
        <div className="diff-modal-footer">
          <button className="diff-modal-btn-cancel" onClick={onClose}>
            Отменить
          </button>
          <button className="diff-modal-btn-confirm" onClick={onConfirm}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
