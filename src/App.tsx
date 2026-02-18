import { useEffect, useMemo, useState } from "react";
import { useYamlEditor, getChangedBlocks, ProblemsPanel, type EditorProblem } from "./MonacoComponent";
import { DiffModal } from "./DiffModal";
import "./App.css";

const MOCK_BACKEND_PROBLEMS: EditorProblem[] = [
  {
    source: "backend",
    severity: "error",
    message: "Значение cluster_name не найдено в реестре кластеров. Проверьте правильность имени.",
    startLineNumber: 23,
    startColumn: 3,
  },
  {
    source: "backend",
    severity: "warning",
    message: "Параметр topic «topic123» устарел. Рекомендуется использовать формат «project.service.topic».",
    startLineNumber: 50,
    startColumn: 3,
  },
];

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
    - CI03194394-CI04115153-CLIENT
# Параметры Dynatrace
dynatrace:
  # Флаг активации
  enabled: true
  reflex-host: reflex.sberift.ru
  cluster_name: IFT_TERRA00024_EDM_OPENSIFT_DELTA
  env_name: sberift
  reflex_labels: "1.281.02"
    agent_version: "dynatrace-1.281-02"
    env: "sbrf.ru"
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
    memory: 351Mi`;

function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const {
    containerRef,
    errorCount,
    problems,
    disabledBlocks,
    handleEnableBlock,
    getFullYaml,
    initialYaml,
    revealLine,
  } = useYamlEditor(yamlConfig, theme);

  const allProblems = useMemo(
    () => [...problems, ...MOCK_BACKEND_PROBLEMS],
    [problems],
  );

  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffYaml, setDiffYaml] = useState("");

  function handleSave() {
    setDiffYaml(getFullYaml());
    setIsDiffOpen(true);
  }

  function handleConfirm() {
    const changedBlocks = getChangedBlocks(initialYaml, diffYaml);
    console.log("Changed blocks:", changedBlocks);
    setIsDiffOpen(false);
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>
          YAML Config Editor
          {errorCount > 0 && (
            <span className="error-badge">
              {errorCount} {errorCount === 1 ? "ошибка" : "ошибок"}
            </span>
          )}
        </h2>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
        </button>
      </div>
      <div className="editor-area">
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
                  title={`Добавить модуль на стенд"${block.name}"`}
                >
                  <span className="block-name">{block.name}</span>
                  <span className="block-plus">+</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <ProblemsPanel
          problems={allProblems}
          onProblemClick={(p: EditorProblem) => p.startLineNumber != null && revealLine(p.startLineNumber)}
        />
      </div>
      <button className="save-btn" onClick={handleSave}>
        Сохранить
      </button>
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

export default App;
