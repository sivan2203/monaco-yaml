import { useYamlEditor } from "./MonacoComponent";
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

function App() {
  const { containerRef, errorCount, disabledBlocks, handleEnableBlock } =
    useYamlEditor(yamlConfig);

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
