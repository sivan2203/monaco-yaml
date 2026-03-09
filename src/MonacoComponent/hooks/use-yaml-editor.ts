import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { type Pair, isMap } from "yaml";
import { monaco } from "../editor-setup/monaco-setup";
import {
  safeParseDocument,
  parseAndFilterYaml,
  extractAllBlocks,
  buildFullYaml,
  setEnabledInBlock,
} from "../utils/yaml-utils";
import type { DisabledBlock, EditorProblem, YamlEditorResult } from "../types";
import type { OnMount } from "@monaco-editor/react";

const SEVERITY_MAP: Record<number, EditorProblem["severity"]> = {
  [monaco.MarkerSeverity.Error]: "error",
  [monaco.MarkerSeverity.Warning]: "warning",
  [monaco.MarkerSeverity.Info]: "info",
  [monaco.MarkerSeverity.Hint]: "info",
};

async function collapseTopLevelYamlBlocks(
  editor: monaco.editor.IStandaloneCodeEditor,
  model: monaco.editor.ITextModel,
) {
  const topLevelLines = getTopLevelYamlStartLines(model);
  if (topLevelLines.length === 0) return;

  await editor.getAction("editor.unfoldAll")?.run();

  for (const lineNumber of topLevelLines) {
    editor.setPosition({ lineNumber, column: 1 });
    await editor.getAction("editor.fold")?.run();
  }
}

function getTopLevelYamlStartLines(model: monaco.editor.ITextModel): number[] {
  const topLevelLines: number[] = [];

  for (
    let lineNumber = 1;
    lineNumber <= model.getLineCount();
    lineNumber += 1
  ) {
    const line = model.getLineContent(lineNumber);
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (trimmedLine.startsWith("#")) continue;
    if (trimmedLine === "---" || trimmedLine === "...") continue;
    if (/^\s/.test(line)) continue;
    if (!/^[^#\s][^:]*:/.test(line)) continue;
    topLevelLines.push(lineNumber);
  }

  return topLevelLines;
}

function getTopLevelYamlBlockRanges(
  model: monaco.editor.ITextModel,
): Map<string, [number, number]> {
  const items: Array<{ lineNumber: number; key: string }> = [];

  for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber++) {
    const line = model.getLineContent(lineNumber);
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed === "---" || trimmed === "...") continue;
    if (/^\s/.test(line)) continue;
    if (!/^[^#\s][^:]*:/.test(line)) continue;
    const key = (line.match(/^([^:]+):/) ?? [])[1]?.trim() ?? "";
    if (key) items.push({ lineNumber, key });
  }

  const result = new Map<string, [number, number]>();
  for (let i = 0; i < items.length; i++) {
    const start = items[i].lineNumber;
    const end =
      i + 1 < items.length
        ? items[i + 1].lineNumber - 1
        : model.getLineCount();
    result.set(items[i].key, [start, end]);
  }
  return result;
}

/**
 * Управляет жизненным циклом YAML-редактора: фильтрацией блоков, проблемами валидации
 * и сборкой полного YAML для сценария сохранения.
 */
export function useYamlEditor(initialYaml: string, onCtrlS?: () => void): YamlEditorResult {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isUpdatingRef = useRef(false);
  const originalBlocksRef = useRef<Map<string, string>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);
  const onCtrlSRef = useRef(onCtrlS);
  onCtrlSRef.current = onCtrlS;

  const [problems, setProblems] = useState<EditorProblem[]>([]);
  const [disabledBlocks, setDisabledBlocks] = useState<DisabledBlock[]>([]);
  const disabledBlocksRef = useRef<DisabledBlock[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { filteredYaml, initialDisabled } = useMemo(() => {
    const result = parseAndFilterYaml(initialYaml);
    return {
      filteredYaml: result.filteredYaml,
      initialDisabled: result.disabledBlocks,
    };
  }, [initialYaml]);

  useEffect(() => {
    originalBlocksRef.current = extractAllBlocks(initialYaml);
    setDisabledBlocks(initialDisabled);
    setIsDirty(false);
  }, [initialYaml, initialDisabled]);

  useEffect(() => {
    disabledBlocksRef.current = disabledBlocks;
  }, [disabledBlocks]);

  useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current);
      disposablesRef.current.forEach((d) => d.dispose());
      disposablesRef.current = [];
    };
  }, []);

  /**
   * Инициализирует Monaco callbacks при монтировании редактора.
   */
  const handleEditorMount: OnMount = useCallback((editor) => {
    disposablesRef.current.forEach((d) => d.dispose());
    disposablesRef.current = [];

    editorRef.current = editor;

    const model = editor.getModel();
    if (!model) return;

    let hasCollapsedOnInit = false;
    const runInitialCollapse = async () => {
      if (hasCollapsedOnInit) return;
      hasCollapsedOnInit = true;
      try {
        await collapseTopLevelYamlBlocks(editor, model);
      } finally {
        setIsEditorReady(true);
      }
    };

    editor.addAction({
      id: "yaml-editor-save",
      label: "Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        onCtrlSRef.current?.();
      },
    });

    const safetyTimer = setTimeout(() => setIsEditorReady(true), 800);
    disposablesRef.current.push({ dispose: () => clearTimeout(safetyTimer) });

    const layoutDisposable = editor.onDidLayoutChange(() => {
      void runInitialCollapse();
      layoutDisposable.dispose();
    });
    disposablesRef.current.push(layoutDisposable);
    void runInitialCollapse();

    /**
     * Отслеживает изменения текста: фильтрует disabled-блоки и синхронизирует sidebar.
     */
    const contentDisposable = model.onDidChangeContent(() => {
      setIsDirty(true);
      if (isUpdatingRef.current) return;
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const currentValue = model.getValue();
        const { filteredYaml: filtered, disabledBlocks: newDisabled } =
          parseAndFilterYaml(currentValue);

        if (newDisabled.length > 0) {
          const blockRanges = getTopLevelYamlBlockRanges(model);
          const edits = newDisabled
            .map((b) => {
              const range = blockRanges.get(b.name);
              if (!range) return null;
              const [startLine, endLine] = range;
              const isLast = endLine >= model.getLineCount();
              return {
                range: new monaco.Range(
                  startLine,
                  1,
                  isLast ? endLine : endLine + 1,
                  isLast ? model.getLineMaxColumn(endLine) : 1,
                ),
                text: "",
              };
            })
            .filter((e) => e !== null);

          if (edits.length > 0) {
            isUpdatingRef.current = true;
            model.applyEdits(edits);
            isUpdatingRef.current = false;
          }
        }

        const valueAfterFilter =
          newDisabled.length > 0 ? filtered : currentValue;

        const currentDoc = safeParseDocument(valueAfterFilter);
        const currentKeys = new Set<string>();
        if (isMap(currentDoc.contents)) {
          for (const item of currentDoc.contents.items) {
            currentKeys.add(String((item as Pair).key));
          }
        }

        setDisabledBlocks((prev) => {
          let next = prev.filter(
            (b) => !(b.reason === "deleted" && currentKeys.has(b.name)),
          );

          if (newDisabled.length > 0) {
            next = [...next, ...newDisabled];
          }

          const knownNames = new Set([
            ...next.map((b) => b.name),
            ...currentKeys,
          ]);
          for (const [origKey, origText] of originalBlocksRef.current) {
            if (!currentKeys.has(origKey) && !knownNames.has(origKey)) {
              next.push({
                name: origKey,
                fullText: setEnabledInBlock(origText, false),
                reason: "deleted",
              });
            }
          }

          return next;
        });
      }, 500);
    });

    const errorDecorations = editor.createDecorationsCollection([]);

    /**
     * Преобразует маркеры Monaco в единый формат EditorProblem
     * и обновляет подсветку строк с ошибками.
     */
    const markerDisposable = monaco.editor.onDidChangeMarkers(([resource]) => {
      if (resource.toString() === model.uri.toString()) {
        const markers = monaco.editor.getModelMarkers({ resource });

        setProblems(
          markers.map((m) => ({
            source: "validation" as const,
            severity: SEVERITY_MAP[m.severity] ?? "info",
            message: m.message,
            startLineNumber: m.startLineNumber,
            startColumn: m.startColumn,
          })),
        );

        errorDecorations.set(
          markers.map((m) => ({
            range: new monaco.Range(m.startLineNumber, 1, m.startLineNumber, 1),
            options: {
              isWholeLine: true,
              className: "error-line-highlight",
              marginClassName: "error-line-highlight-margin",
            },
          })),
        );
      }
    });

    disposablesRef.current.push(contentDisposable, markerDisposable);
  }, []);

  /**
   * Возвращает выбранный блок из sidebar обратно в YAML и включает enabled=true.
   */
  const handleEnableBlock = useCallback((block: DisabledBlock) => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const enabledBlockText = setEnabledInBlock(block.fullText, true).trim();
    const lastLine = model.getLineCount();
    const lastColumn = model.getLineMaxColumn(lastLine);
    const newBlockLine = lastLine + 1;
    // Capture before edit — Monaco shifts this line down after insert
    const lastTopLevelLine = getTopLevelYamlStartLines(model).at(-1);

    isUpdatingRef.current = true;
    model.applyEdits([{
      range: new monaco.Range(lastLine, lastColumn, lastLine, lastColumn),
      text: "\n" + enabledBlockText,
    }]);
    isUpdatingRef.current = false;

    // Monaco extends the last block's stored fold range to include the newly
    // appended lines. Fix this only when the last block was actually folded:
    // compare Y positions of consecutive lines — equal Y means the next line
    // is hidden inside a fold (collapsed).
    setTimeout(async () => {
      if (lastTopLevelLine !== undefined) {
        const topN = editor.getTopForLineNumber(lastTopLevelLine);
        const topN1 = editor.getTopForLineNumber(lastTopLevelLine + 1);
        const isLastBlockFolded = topN === topN1;

        if (isLastBlockFolded) {
          editor.setPosition({ lineNumber: lastTopLevelLine, column: 1 });
          await editor.getAction("editor.unfold")?.run();
          await editor.getAction("editor.fold")?.run();
        }
      }

      // Always unfold the newly added block
      editor.setPosition({ lineNumber: newBlockLine, column: 1 });
      await editor.getAction("editor.unfold")?.run();

      editor.revealLine(newBlockLine);
      editor.setPosition({ lineNumber: newBlockLine, column: 1 });
      editor.focus();
    }, 0);

    setDisabledBlocks((prev) => prev.filter((b) => b.name !== block.name));
  }, []);

  /**
   * Собирает финальный YAML для сохранения: текст редактора + disabled/deleted блоки.
   */
  const getFullYaml = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return initialYaml;
    const model = editor.getModel();
    if (!model) return initialYaml;
    const originalKeyOrder = [...originalBlocksRef.current.keys()];
    return buildFullYaml(
      model.getValue(),
      disabledBlocksRef.current,
      originalKeyOrder,
    );
  }, [initialYaml]);

  /**
   * Прокручивает редактор к строке проблемы и ставит туда курсор.
   */
  const resetDirty = useCallback(() => setIsDirty(false), []);

  const revealLine = useCallback((line: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.focus();
  }, []);

  return {
    defaultValue: filteredYaml,
    handleEditorMount,
    isEditorReady,
    errorCount: problems.length,
    problems,
    disabledBlocks,
    handleEnableBlock,
    getFullYaml,
    initialYaml,
    revealLine,
    isDirty,
    resetDirty,
  };
}
