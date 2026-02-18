import { useRef, useEffect, useState, useCallback } from "react";
import {
  parseDocument,
  Document,
  YAMLMap,
  type Pair,
  isMap,
  isScalar,
  visit,
} from "yaml";
import { monaco } from "../editor-setup/monaco-setup";
import {
  parseAndFilterYaml,
  extractAllBlocks,
  buildFullYaml,
  setEnabledInBlock,
} from "../utils/yaml-utils";
import type { DisabledBlock, EditorProblem, YamlEditorResult } from "../types";

const MODEL_URI = "file:///config.yaml";

const SEVERITY_MAP: Record<number, EditorProblem["severity"]> = {
  [monaco.MarkerSeverity.Error]: "error",
  [monaco.MarkerSeverity.Warning]: "warning",
  [monaco.MarkerSeverity.Info]: "info",
  [monaco.MarkerSeverity.Hint]: "info",
};

export function useYamlEditor(initialYaml: string, theme: "dark" | "light" = "dark"): YamlEditorResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isUpdatingRef = useRef(false);
  const originalBlocksRef = useRef<Map<string, string>>(new Map());
  const [errorCount, setErrorCount] = useState(0);
  const [problems, setProblems] = useState<EditorProblem[]>([]);
  const [disabledBlocks, setDisabledBlocks] = useState<DisabledBlock[]>([]);
  const disabledBlocksRef = useRef<DisabledBlock[]>([]);

  useEffect(() => {
    disabledBlocksRef.current = disabledBlocks;
  }, [disabledBlocks]);

  useEffect(() => {
    if (!containerRef.current) return;

    originalBlocksRef.current = extractAllBlocks(initialYaml);

    const { filteredYaml, disabledBlocks: initialDisabled } =
      parseAndFilterYaml(initialYaml);
    setDisabledBlocks(initialDisabled);

    const uri = monaco.Uri.parse(MODEL_URI);
    const existingModel = monaco.editor.getModel(uri);
    const model =
      existingModel ?? monaco.editor.createModel(filteredYaml, "yaml", uri);

    const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: monacoTheme,
      fontSize: 15,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      roundedSelection: false,
      padding: { top: 12 },
      folding: true,
      lineNumbers: "on",
      glyphMargin: false,
      renderLineHighlight: "all",
      cursorBlinking: "smooth",
      automaticLayout: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      formatOnType: true,
    });

    editorRef.current = editor;

    setTimeout(() => {
      editor.getAction("editor.foldLevel1")?.run();
    }, 100);

    let debounceTimer: ReturnType<typeof setTimeout>;

    const contentDisposable = model.onDidChangeContent(() => {
      if (isUpdatingRef.current) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const currentValue = model.getValue();
        const { filteredYaml, disabledBlocks: newDisabled } =
          parseAndFilterYaml(currentValue);

        const valueAfterFilter =
          newDisabled.length > 0 ? filteredYaml : currentValue;

        if (newDisabled.length > 0) {
          isUpdatingRef.current = true;
          model.setValue(filteredYaml);
          isUpdatingRef.current = false;
        }

        const currentDoc = parseDocument(valueAfterFilter, {
          uniqueKeys: false,
          strict: false,
        });
        currentDoc.errors = [];
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
        setErrorCount(markers.length);

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

    return () => {
      clearTimeout(debounceTimer);
      contentDisposable.dispose();
      markerDisposable.dispose();
      editor.dispose();
      model.dispose();
    };
  }, []);

  useEffect(() => {
    monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
  }, [theme]);

  const handleEnableBlock = useCallback((block: DisabledBlock) => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const blockDoc = parseDocument(block.fullText, {
      uniqueKeys: false,
      strict: false,
    });
    blockDoc.errors = [];

    visit(blockDoc, {
      Pair(_, pair) {
        if (
          isScalar(pair.key) &&
          pair.key.value === "enabled" &&
          isScalar(pair.value) &&
          pair.value.value === false
        ) {
          pair.value.value = true;
          return visit.BREAK;
        }
      },
    });

    const mainDoc = parseDocument(model.getValue(), {
      uniqueKeys: false,
      strict: false,
    });
    mainDoc.errors = [];
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
    containerRef,
    errorCount,
    problems,
    disabledBlocks,
    handleEnableBlock,
    getFullYaml,
    initialYaml,
    revealLine,
  };
}
