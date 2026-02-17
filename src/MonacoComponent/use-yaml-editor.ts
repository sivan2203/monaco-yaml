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
import { monaco } from "./monaco-setup";
import { parseAndFilterYaml, extractAllBlocks } from "./yaml-utils";
import type { DisabledBlock, YamlEditorResult } from "./types";

const MODEL_URI = "file:///config.yaml";

export function useYamlEditor(initialYaml: string): YamlEditorResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isUpdatingRef = useRef(false);
  const originalBlocksRef = useRef<Map<string, string>>(new Map());
  const [errorCount, setErrorCount] = useState(0);
  const [disabledBlocks, setDisabledBlocks] = useState<DisabledBlock[]>([]);

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

    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: "vs-dark",
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
                fullText: origText,
                reason: "deleted",
              });
            }
          }

          return next;
        });
      }, 500);
    });

    const markerDisposable = monaco.editor.onDidChangeMarkers(([resource]) => {
      if (resource.toString() === model.uri.toString()) {
        const markers = monaco.editor.getModelMarkers({ resource });
        setErrorCount(markers.length);
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

    if (block.reason === "disabled") {
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
    }

    const mainDoc = parseDocument(model.getValue(), {
      uniqueKeys: false,
      strict: false,
    });
    mainDoc.errors = [];
    const blockContents = blockDoc.contents as YAMLMap;
    for (const item of blockContents.items) {
      (mainDoc.contents as YAMLMap).items.push(item);
    }

    isUpdatingRef.current = true;
    model.setValue(mainDoc.toString().trim());
    isUpdatingRef.current = false;
    setDisabledBlocks((prev) => prev.filter((b) => b.name !== block.name));
  }, []);

  return { containerRef, errorCount, disabledBlocks, handleEnableBlock };
}
