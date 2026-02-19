import { useRef, useEffect, useCallback } from "react";
import { DiffEditor, type DiffOnMount } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";
import { getMonacoTheme, type Theme } from "./types";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalYaml: string;
  currentYaml: string;
  theme?: Theme;
}

const DIFF_OPTIONS = {
  readOnly: true,
  originalEditable: false,
  renderSideBySide: true,
  enableSplitViewResizing: true,
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 8 },
} as const;

export function DiffModal({
  isOpen,
  onClose,
  onConfirm,
  originalYaml,
  currentYaml,
  theme = "dark",
}: DiffModalProps) {
  const modelsRef = useRef<{
    original: monacoEditor.editor.ITextModel | null;
    modified: monacoEditor.editor.ITextModel | null;
  }>({ original: null, modified: null });

  const handleDiffMount: DiffOnMount = useCallback((editor) => {
    const model = editor.getModel();
    if (model) {
      modelsRef.current = { original: model.original, modified: model.modified };
    }
  }, []);

  useEffect(() => {
    if (isOpen) return;
    const { original, modified } = modelsRef.current;
    if (original && !original.isDisposed()) original.dispose();
    if (modified && !modified.isDisposed()) modified.dispose();
    modelsRef.current = { original: null, modified: null };
  }, [isOpen]);

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
    <div className="yce-diff-overlay" onClick={handleOverlayClick}>
      <div className="yce-diff-content">
        <div className="yce-diff-header">
          <span className="yce-diff-title">Подтверждение изменений</span>
          <div className="yce-diff-labels">
            <span className="yce-diff-label yce-diff-label-original">Исходный</span>
            <span className="yce-diff-label yce-diff-label-modified">Текущий</span>
          </div>
        </div>
        <div className="yce-diff-body">
          <DiffEditor
            height="100%"
            original={originalYaml}
            modified={currentYaml}
            language="yaml"
            theme={getMonacoTheme(theme)}
            options={DIFF_OPTIONS}
            keepCurrentOriginalModel
            keepCurrentModifiedModel
            onMount={handleDiffMount}
          />
        </div>
        <div className="yce-diff-footer">
          <button className="yce-diff-btn-cancel" onClick={onClose}>
            Отменить
          </button>
          <button className="yce-diff-btn-confirm" onClick={onConfirm}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
