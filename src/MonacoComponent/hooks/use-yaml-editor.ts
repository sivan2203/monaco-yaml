import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { YAMLMap, type Pair, isMap } from "yaml";
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

export function useYamlEditor(initialYaml: string): YamlEditorResult {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isUpdatingRef = useRef(false);
  const originalBlocksRef = useRef<Map<string, string>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);

  const [problems, setProblems] = useState<EditorProblem[]>([]);
  const [disabledBlocks, setDisabledBlocks] = useState<DisabledBlock[]>([]);
  const disabledBlocksRef = useRef<DisabledBlock[]>([]);

  const { filteredYaml, initialDisabled } = useMemo(() => {
    const result = parseAndFilterYaml(initialYaml);
    return { filteredYaml: result.filteredYaml, initialDisabled: result.disabledBlocks };
  }, [initialYaml]);

  useEffect(() => {
    originalBlocksRef.current = extractAllBlocks(initialYaml);
    setDisabledBlocks(initialDisabled);
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

  const handleEditorMount: OnMount = useCallback((editor) => {
    disposablesRef.current.forEach((d) => d.dispose());
    disposablesRef.current = [];

    editorRef.current = editor;

    setTimeout(() => {
      editor.getAction("editor.foldLevel1")?.run();
    }, 100);

    const model = editor.getModel();
    if (!model) return;

    const contentDisposable = model.onDidChangeContent(() => {
      if (isUpdatingRef.current) return;
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const currentValue = model.getValue();
        const { filteredYaml: filtered, disabledBlocks: newDisabled } =
          parseAndFilterYaml(currentValue);

        if (newDisabled.length > 0) {
          isUpdatingRef.current = true;
          model.setValue(filtered);
          isUpdatingRef.current = false;
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

  const handleEnableBlock = useCallback((block: DisabledBlock) => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const enabledBlockYaml = setEnabledInBlock(block.fullText, true);
    const blockDoc = safeParseDocument(enabledBlockYaml);

    const mainDoc = safeParseDocument(model.getValue());
    if (!isMap(mainDoc.contents)) {
      mainDoc.contents = new YAMLMap();
    }
    const blockContents = blockDoc.contents as YAMLMap;
    for (const item of blockContents.items) {
      (mainDoc.contents as YAMLMap).items.push(item);
    }

    isUpdatingRef.current = true;
    model.setValue(mainDoc.toString().trim());
    isUpdatingRef.current = false;
    setDisabledBlocks((prev) => prev.filter((b) => b.name !== block.name));
  }, []);

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
    errorCount: problems.length,
    problems,
    disabledBlocks,
    handleEnableBlock,
    getFullYaml,
    initialYaml,
    revealLine,
  };
}
