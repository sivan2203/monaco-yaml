import { useEffect, useState } from "react";
import { YamlConfigEditor, type EditorProblem, type Theme } from "./MonacoComponent";
import schema from "./MonacoComponent/editor-setup/schema.json";
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
  reflex-host: reflex.acmenet.ru
  cluster_name: IFT_TERRA00024_EDM_OPENSIFT_DELTA
  env_name: acmenet
  reflex_labels: "1.281.02"
    agent_version: "dynatrace-1.281-02"
    env: "acme.ru"
    cluster: "dynatrace"
    project_name: "cad8393c1-47a7-4149-aaf0-4fd6e617ed0e"
    project: "c102493683-reflex"

# Параметры Fluentbit sidecar
fluentbit:
  enabled: true
  # sidecar
  kafka-brokers:
    - tvldgaudi0003.delta.acme.ru:9093
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
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  function handleSave(changedBlocks: Record<string, unknown>[]) {
    console.log("Changed blocks:", changedBlocks);
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>YAML Config Editor</h2>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
        </button>
      </div>
      <YamlConfigEditor
        yamlConfig={yamlConfig}
        schema={schema as unknown as Record<string, unknown>}
        theme={theme}
        backendProblems={MOCK_BACKEND_PROBLEMS}
        onSave={handleSave}
      />
    </div>
  );
}

export default App;
