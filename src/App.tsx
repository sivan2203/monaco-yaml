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
import "./App.css";

const yamlConfig = `# Фильтр входящих подключений
cn:
  # Флаг активации подключений
  # Флаг активации подключений
  # Флаг активации подключений
  enabled: false
  whitelist: false
  whitelist:
    - CI03194394-CI041129-CLIENT
    - CI0198749-CI017697072-SERVER-CLIENT
    - CI03194394-CI041130-CLIENT
    - CI03194394-CI04115153-CLIENT   # Dynatrace

# Параметры Dynatrace
dynatrace:
  # Флаг активации
  enabled: true
  reflex-host: reflex.sberift.ru
  cluster_name: IFT_TERRA00024_EDM_OPENSIFT_DELTA
  env_name: sberift
  reflex_labels: "1.281.02"
    agent_version: "dynatrace-1.281-02"
    env: "cad" "sbrf.ru"
    cluster: "dynatrace"
    project_name: "cad8393c1-47a7-4149-aaf0-4fd6e617ed0e"
    project: "c102493683-reflex"

# Параметры Fluentbit sidecar
fluentbit:
  enabled: true
  # sidecar
  kafka-brokers:
    - tvldgaudi0003.delta.sbrf.ru:9093
  cpu:
    limits:
      cpu: 101m
  memory:
    limits: 512Mi
  liveness-probe:
    initial_delay_seconds: 120
  readiness-probe:
    initial_delay_seconds: 120
  requests:
    cpu: 5m
    memory: 256Mi
  topic: topic123

# Параметры OTT sidecar
ott:
  params:
    # Флаг активации
    enabled: true
    cpu:
      limits: 350m
    memory: 701Mi
  liveness-probe:
    initial_delay_seconds: 121
  readiness-probe:
    initial_delay_seconds: 121
  requests:
    cpu: 25m
    memory: 351Mi
`;

const MODEL_URI = "file:///config.yaml";

interface DisabledBlock {
  name: string;
  fullText: string;
  reason: "disabled" | "deleted";
}

function hasEnabledFalse(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  if (rec.enabled === false) return true;
  return Object.values(rec).some(hasEnabledFalse);
}

function parseAndFilterYaml(yaml: string): {
  filteredYaml: string;
  disabledBlocks: DisabledBlock[];
} {
  const doc = parseDocument(yaml, { uniqueKeys: false, strict: false });
  doc.errors = [];

  const contents = doc.contents;
  if (!isMap(contents)) return { filteredYaml: yaml, disabledBlocks: [] };

  const disabledBlocks: DisabledBlock[] = [];
  const keysToRemove: string[] = [];
  const jsDoc = doc.toJS() as Record<string, unknown>;

  for (const item of contents.items) {
    const pair = item as Pair;
    const key = String(pair.key);
    const jsValue = jsDoc[key];
    if (hasEnabledFalse(jsValue)) {
      const tempDoc = new Document();
      tempDoc.contents = new YAMLMap();
      (tempDoc.contents as YAMLMap).items = [(pair as Pair).clone()];
      disabledBlocks.push({
        name: key,
        fullText: tempDoc.toString().trim(),
        reason: "disabled",
      });
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) doc.delete(key);

  return {
    filteredYaml: doc.toString().trim(),
    disabledBlocks,
  };
}

function extractAllBlocks(yaml: string): Map<string, string> {
  const doc = parseDocument(yaml, { uniqueKeys: false, strict: false });
  doc.errors = [];
  const blocks = new Map<string, string>();
  const contents = doc.contents;
  if (!isMap(contents)) return blocks;

  for (const item of contents.items) {
    const pair = item as Pair;
    const key = String(pair.key);
    const tempDoc = new Document();
    tempDoc.contents = new YAMLMap();
    (tempDoc.contents as YAMLMap).items = [(pair as Pair).clone()];
    blocks.set(key, tempDoc.toString().trim());
  }

  return blocks;
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isUpdatingRef = useRef(false);
  const originalBlocksRef = useRef<Map<string, string>>(new Map());
  const [errorCount, setErrorCount] = useState(0);
  const [disabledBlocks, setDisabledBlocks] = useState<DisabledBlock[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    originalBlocksRef.current = extractAllBlocks(yamlConfig);

    const { filteredYaml, disabledBlocks: initialDisabled } =
      parseAndFilterYaml(yamlConfig);
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

  return (
    <div className="app-container">
      <h2>
        YAML Config Editor
        {errorCount > 0 && (
          <span className="error-badge">
            {errorCount} {errorCount === 1 ? "ошибка" : "ошибок"}
          </span>
        )}
      </h2>
      <div className="editor-wrapper">
        <div className="editor-panel">
          <div ref={containerRef} style={{ height: "100%" }} />
        </div>
        {disabledBlocks.length > 0 && (
          <div className="sidebar-panel">
            <div className="sidebar-title">Отключённые блоки</div>
            {disabledBlocks.map((block) => (
              <button
                key={block.name}
                className="sidebar-block-btn"
                onClick={() => handleEnableBlock(block)}
                title={`Включить блок "${block.name}"`}
              >
                <span className="block-name">{block.name}</span>
                <span className="block-plus">+</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
