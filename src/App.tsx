import { useEffect, useMemo, useState } from "react";
import { YamlConfigEditor, type EditorProblem, type Theme } from "./MonacoComponent";
import { mockBlockRunner } from "./MonacoComponent/save-flow";
import fallbackSchema from "./MonacoComponent/editor-setup/schema.json";
import {
  extractSchemaFromResponse,
  extractServiceSettings,
  generateYamlFromConfigData,
  resolveSchemaForEditor,
  type BackendConfigResponse,
} from "./MonacoComponent/yaml-generator";
import "./App.css";

const MOCK_BACKEND_PROBLEMS: EditorProblem[] = [];

const MOCK_CONFIG_RESPONSE: BackendConfigResponse = {
  data: {
    serviceSettings: {
      cn: {
        enabled: false,
        whitelist: true,
        whitelistList: [
          "CI03194394-CI041129-CLIENT",
          "CI0198749-CI017697072-SERVER-CLIENT",
          "CI03194394-CI041130-CLIENT",
        ],
      },
      dynatrace: {
        enabled: true,
        reflexHost: "reflex.acmenet.ru",
        cluster_name: "IFT_TERRA00024_EDM_OPENSIFT_DELTA",
        env_name: "acmenet",
        reflex_labels: "team=gateway,service=api",
      },
      fluentbit: {
        enabled: true,
        kafkaBrokers: ["tvldgaudi0003.delta.acme.ru:9093"],
        cpu: {
          limits: "101m",
        },
        memory: {
          limits: "512Mi",
        },
        livenessProbe: {
          initialDelaySeconds: 120,
        },
        readinessProbe: {
          initialDelaySeconds: 120,
        },
        requests: {
          cpu: "5m",
          memory: "256Mi",
        },
        topic: "topic123",
      },
      ott: {
        params: {
          enabled: true,
          cpu: {
            limits: "350m",
          },
          memory: {
            limits: "701Mi",
          },
        },
      },
      "rate-limits": {
        enabled: false,
      },
      union: {
        enabled: true,
        replicas: 1,
      },
    },
  },
};

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const editorSchema = useMemo(
    () =>
      resolveSchemaForEditor({
        backendSchema: extractSchemaFromResponse(MOCK_CONFIG_RESPONSE),
        fallbackSchema: fallbackSchema as Record<string, unknown>,
      }),
    [],
  );

  const yamlConfig = useMemo(
    () =>
      generateYamlFromConfigData(
        {
          serviceSettings: extractServiceSettings(MOCK_CONFIG_RESPONSE),
        },
        editorSchema,
      ),
    [editorSchema],
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /**
   * Переключает тему демонстрационного приложения.
   */
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  /**
   * Получает подтверждённые изменённые блоки после успешного save-flow.
   */
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
        schema={editorSchema as Record<string, unknown>}
        theme={theme}
        backendProblems={MOCK_BACKEND_PROBLEMS}
        onSave={handleSave}
        saveFlowRunner={mockBlockRunner}
      />
    </div>
  );
}

export default App;
