import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { configureMonacoYaml } from "monaco-yaml";
import { useYamlEditor } from "./hooks/use-yaml-editor";
import { getChangedBlocks, convertYamlKeysToCamelCase, setEnabledInBlock } from "./utils/yaml-utils";
import type { DisabledBlock } from "./types";
import { ProblemsPanel } from "./ui/problems-panel";
import { DiffModal } from "./diff-modal";
import {
  SaveSuccessModal,
  mapSaveErrorsToBackendProblems,
  mockBlockRunner,
  runSaveFlow,
} from "./save-flow";
import { monaco } from "./editor-setup/monaco-setup";
import { getMonacoTheme } from "./types";
import type { YamlConfigEditorProps, EditorProblem } from "./types";
import "./styles.css";


function applyToCamelCase(
  item: monaco.languages.CompletionItem,
): monaco.languages.CompletionItem {
  if (typeof item.insertText === "string") {
    item.insertText = convertYamlKeysToCamelCase(item.insertText);
  }
  return item;
}

export function YamlConfigEditor({
  yamlConfig,
  schema,
  theme = "dark",
  backendProblems = [],
  onSave,
  saveFlowRunner,
  onCancel,
}: YamlConfigEditorProps) {
  const yamlDisposableRef = useRef<{ dispose(): void } | null>(null);
  const disabledBlocksForCompletionRef = useRef<DisabledBlock[]>([]);

  useEffect(() => {
    yamlDisposableRef.current?.dispose();

    const origRegister = monaco.languages.registerHoverProvider.bind(
      monaco.languages,
    );
    monaco.languages.registerHoverProvider = (languageId, provider) => {
      if (languageId === "yaml" && provider.provideHover) {
        const origHover = provider.provideHover.bind(provider);
        provider.provideHover = async (...args) => {
          const result = await origHover(...args);
          if (result) {
            for (const c of result.contents) {
              if (typeof c === "object" && "value" in c) {
                const hoverContent = c as { value: string };
                hoverContent.value = hoverContent.value.replace(
                  /\nSource: \[.*?\]\(.*?\)\s*$/,
                  "",
                );
              }
            }
          }
          return result;
        };
      }
      return origRegister(languageId, provider);
    };

    const origRegisterCompletion =
      monaco.languages.registerCompletionItemProvider.bind(monaco.languages);
    monaco.languages.registerCompletionItemProvider = (languageId, provider) => {
      if (languageId === "yaml" && provider.provideCompletionItems) {
        const origProvide = provider.provideCompletionItems.bind(provider);
        provider.provideCompletionItems = async (...args) => {
          const result = await origProvide(...args);
          if (result && "suggestions" in result) {
            result.suggestions = result.suggestions.map((item) => {
              const processed = applyToCamelCase(item);
              const labelStr = typeof processed.label === "string"
                ? processed.label
                : (processed.label as { label: string }).label;
              const disabledBlock = disabledBlocksForCompletionRef.current.find(
                (b) => b.name === labelStr,
              );
              if (disabledBlock && typeof processed.insertText === "string") {
                processed.insertText = convertYamlKeysToCamelCase(
                  setEnabledInBlock(disabledBlock.fullText, true).trim(),
                );
                processed.insertTextRules = 0;
              }
              return processed;
            });
          }
          return result;
        };
        if (provider.resolveCompletionItem) {
          const origResolve = provider.resolveCompletionItem.bind(provider);
          provider.resolveCompletionItem = async (...args) => {
            const item = await origResolve(...args);
            if (!item) return item;
            const processed = applyToCamelCase(item);
            const labelStr = typeof processed.label === "string"
              ? processed.label
              : (processed.label as { label: string }).label;
            const disabledBlock = disabledBlocksForCompletionRef.current.find(
              (b) => b.name === labelStr,
            );
            if (disabledBlock && typeof processed.insertText === "string") {
              processed.insertText = convertYamlKeysToCamelCase(
                setEnabledInBlock(disabledBlock.fullText, true).trim(),
              );
              processed.insertTextRules = 0;
            }
            return processed;
          };
        }
      }
      return origRegisterCompletion(languageId, provider);
    };

    yamlDisposableRef.current = configureMonacoYaml(monaco, {
      enableSchemaRequest: false,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      schemas: [
        {
          uri: "schema://config",
          fileMatch: ["**/config.yaml"],
          schema: schema as Record<string, unknown>,
        },
      ],
    });

    monaco.languages.registerHoverProvider = origRegister;
    monaco.languages.registerCompletionItemProvider = origRegisterCompletion;

    return () => {
      yamlDisposableRef.current?.dispose();
      yamlDisposableRef.current = null;
    };
  }, [schema]);

  const {
    defaultValue,
    handleEditorMount,
    isEditorReady,
    errorCount,
    problems,
    disabledBlocks,
    handleEnableBlock,
    getFullYaml,
    initialYaml,
    revealLine,
    isDirty,
    resetDirty,
  } = useYamlEditor(yamlConfig, schema, handleSave);

  useEffect(() => {
    disabledBlocksForCompletionRef.current = disabledBlocks;
  }, [disabledBlocks]);

  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffYaml, setDiffYaml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveBackendProblems, setSaveBackendProblems] = useState<
    EditorProblem[]
  >([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const allProblems = useMemo(
    () => [...problems, ...backendProblems, ...saveBackendProblems],
    [problems, backendProblems, saveBackendProblems],
  );

  /**
   * Готовит полный YAML и открывает diff перед подтверждением сохранения.
   */
  function handleSave() {
    setDiffYaml(getFullYaml());
    setIsDiffOpen(true);
  }

  /**
   * Запускает последовательный save-flow по изменённым блокам и
   * обновляет UI в зависимости от результата (ошибки/успех).
   */
  async function handleConfirm() {
    if (isSaving) return;

    const changedBlocks = getChangedBlocks(initialYaml, diffYaml);
    const activeRunner = saveFlowRunner ?? mockBlockRunner;

    setIsSaving(true);

    try {
      const saveResult = await runSaveFlow(changedBlocks, activeRunner);
      if (!saveResult.isSuccess) {
        setSaveBackendProblems(
          mapSaveErrorsToBackendProblems(saveResult.errors),
        );
        return;
      }

      setSaveBackendProblems([]);
      onSave?.(changedBlocks);
      resetDirty();
      setIsDiffOpen(false);
      setIsSuccessOpen(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="yce-root" data-theme={theme}>
      <div className="yce-header">
        <span className="yce-title">
          YAML Config Editor
          {errorCount > 0 && (
            <span className="yce-error-badge">
              {errorCount} {errorCount === 1 ? "ошибка" : "ошибок"}
            </span>
          )}
        </span>
      </div>
      <div className={`yce-unsaved-banner${isDirty ? " yce-unsaved-banner--visible" : ""}`}>
        Есть несохраненные данные
      </div>
      <div className="yce-editor-area">
        <div className="yce-editor-wrapper">
          <div
            className="yce-editor-panel"
            style={{
              opacity: isEditorReady ? 1 : 0,
              transition: "opacity 0.15s ease-in",
            }}
          >
            <Editor
              height="100%"
              defaultValue={defaultValue}
              path="file:///config.yaml"
              saveViewState={false}
              language="yaml"
              theme={getMonacoTheme(theme)}
              onMount={handleEditorMount}
              options={{
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
                hover: { above: false },
              }}
            />
          </div>
          {disabledBlocks.length > 0 && (
            <div className="yce-sidebar">
              <div className="yce-sidebar-title">Отключённые блоки</div>
              {disabledBlocks.map((block) => (
                <button
                  key={block.name}
                  className="yce-sidebar-btn"
                  onClick={() => handleEnableBlock(block)}
                  title={`Добавить модуль на стенд "${block.name}"`}
                >
                  <span className="yce-block-name">{block.name}</span>
                  <span className="yce-block-plus">+</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <ProblemsPanel
          problems={allProblems}
          onProblemClick={(p: EditorProblem) =>
            p.startLineNumber != null && revealLine(p.startLineNumber)
          }
        />
      </div>
      <div className="yce-footer">
        {onCancel && (
          <button className="yce-btn-cancel" onClick={onCancel}>
            Отменить
          </button>
        )}
        <button className="yce-btn-save" onClick={handleSave}>
          Сохранить
        </button>
      </div>
      <DiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        onConfirm={handleConfirm}
        originalYaml={initialYaml}
        currentYaml={diffYaml}
        theme={theme}
        isSaving={isSaving}
      />
      <SaveSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}
