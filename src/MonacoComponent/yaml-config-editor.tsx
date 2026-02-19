import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { configureMonacoYaml } from "monaco-yaml";
import { useYamlEditor } from "./hooks/use-yaml-editor";
import { getChangedBlocks } from "./utils/yaml-utils";
import { ProblemsPanel } from "./ui/problems-panel";
import { DiffModal } from "./diff-modal";
import { monaco } from "./editor-setup/monaco-setup";
import { getMonacoTheme } from "./types";
import type { YamlConfigEditorProps, EditorProblem } from "./types";
import "./styles.css";

export function YamlConfigEditor({
  yamlConfig,
  schema,
  theme = "dark",
  backendProblems = [],
  onSave,
  onCancel,
}: YamlConfigEditorProps) {
  const yamlDisposableRef = useRef<{ dispose(): void } | null>(null);

  useEffect(() => {
    yamlDisposableRef.current?.dispose();
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
    return () => {
      yamlDisposableRef.current?.dispose();
      yamlDisposableRef.current = null;
    };
  }, [schema]);

  const {
    defaultValue,
    handleEditorMount,
    errorCount,
    problems,
    disabledBlocks,
    handleEnableBlock,
    getFullYaml,
    initialYaml,
    revealLine,
  } = useYamlEditor(yamlConfig);

  const allProblems = useMemo(
    () => [...problems, ...backendProblems],
    [problems, backendProblems],
  );

  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffYaml, setDiffYaml] = useState("");

  function handleSave() {
    setDiffYaml(getFullYaml());
    setIsDiffOpen(true);
  }

  function handleConfirm() {
    const changedBlocks = getChangedBlocks(initialYaml, diffYaml);
    onSave?.(changedBlocks);
    setIsDiffOpen(false);
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
      <div className="yce-editor-area">
        <div className="yce-editor-wrapper">
          <div className="yce-editor-panel">
            <Editor
              height="100%"
              defaultValue={defaultValue}
              path="file:///config.yaml"
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
      />
    </div>
  );
}
