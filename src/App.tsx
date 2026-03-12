import { useEffect, useMemo, useState } from "react";
import { YamlConfigEditor, type EditorProblem, type Theme } from "./MonacoComponent";
import {
  useSwitchSaveFlowRunner,
  type UpdateOttParamsInput,
} from "./MonacoComponent/save-flow";
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
  "data": {
      "serviceSettings": {
          "cn": {
              "enabled": true,
              "whitelist": []
          },
          "fluentbit": {
              "kafkaBrokers": [
                  "sgsdgd:9093",
                  "teeatat:9093"
              ],
              "enabled": true,
              "topic": "test",
              "requests": {
                  "cpu": "50m",
                  "memory": "256M"
              },
              "limits": {
                  "cpu": "100m",
                  "memory": "512M"
              },
              "livenessProbe": {
                  "initialDelaySeconds": 120
              },
              "readinessProbe": {
                  "initialDelaySeconds": 120
              }
          },
          "unimon": {
              "enabled": false,
              "topic": "test",
              "agent": {
                  "limits": {
                      "cpu": "200m",
                      "memory": "500M"
                  },
                  "requests": {
                      "cpu": "150m",
                      "memory": "250M"
                  },
                  "istio": {
                      "limits": {
                          "cpu": "100m",
                          "memory": "128M"
                      },
                      "requests": {
                          "cpu": "50m",
                          "memory": "64M"
                      },
                      "livenessProbe": {
                          "initialDelaySeconds": 120
                      },
                      "readinessProbe": {
                          "initialDelaySeconds": 120
                      },
                      "replicas": 1
                  },
                  "vault": {
                      "limits": {
                          "cpu": "100m",
                          "memory": "128M"
                      },
                      "requests": {
                          "cpu": "50m",
                          "memory": "64M"
                      },
                      "livenessProbe": {
                          "initialDelaySeconds": 120
                      },
                      "readinessProbe": {
                          "initialDelaySeconds": 120
                      }
                  },
                  "livenessProbe": {
                      "initialDelaySeconds": 120
                  },
                  "readinessProbe": {
                      "initialDelaySeconds": 120
                  }
              },
              "sender": {
                  "limits": {
                      "cpu": "300m",
                      "memory": "1500M"
                  },
                  "requests": {
                      "cpu": "150m",
                      "memory": "1500M"
                  },
                  "istio": {
                      "limits": {
                          "cpu": "100m",
                          "memory": "128M"
                      },
                      "requests": {
                          "cpu": "50m",
                          "memory": "64M"
                      },
                      "livenessProbe": {
                          "initialDelaySeconds": 120
                      },
                      "readinessProbe": {
                          "initialDelaySeconds": 120
                      },
                      "replicas": 1
                  },
                  "vault": {
                      "limits": {
                          "cpu": "100m",
                          "memory": "128M"
                      },
                      "requests": {
                          "cpu": "50m",
                          "memory": "64M"
                      },
                      "livenessProbe": {
                          "initialDelaySeconds": 120
                      },
                      "readinessProbe": {
                          "initialDelaySeconds": 120
                      }
                  },
                  "livenessProbe": {
                      "initialDelaySeconds": 120
                  },
                  "readinessProbe": {
                      "initialDelaySeconds": 120
                  }
              }
          },
          "ufsParams": {
              "requests": {
                  "cpu": "500m",
                  "memory": "800M"
              },
              "limits": {
                  "cpu": "500m",
                  "memory": "800M"
              },
              "livenessProbe": {
                  "initialDelaySeconds": 120
              },
              "readinessProbe": {
                  "initialDelaySeconds": 120
              }
          },
          "ufsSession": {
              "limits": {
                  "cpu": "600m",
                  "memory": "1500M"
              },
              "requests": {
                  "cpu": "300m",
                  "memory": "1500M"
              },
              "livenessProbe": {
                  "initialDelaySeconds": 120
              },
              "readinessProbe": {
                  "initialDelaySeconds": 120
              }
          },
          "ottParams": {
              "mode": "observe_provider_authz_local_pdp",
              "limits": {
                  "cpu": "200m",
                  "memory": "300Mi"
              },
              "requests": {
                  "cpu": "200m",
                  "memory": "300Mi"
              },
              "livenessProbe": {
                  "initialDelaySeconds": 120
              },
              "readinessProbe": {
                  "initialDelaySeconds": 120
              }
          },
          "rateLimits": {
              "enabled": false,
              "rps": 2
          },
          "app": null,
          "egress": null,
          "ingress": null,
          "dbMigration": {
              "command": "yoyo apply --database $DB_URL migrations_dir",
              "limits": {
                  "cpu": "200m",
                  "memory": "200M"
              },
              "requests": {
                  "cpu": "100m",
                  "memory": "100M"
              }
          },
          "dynatrace": {
              "enabled": false,
              "reflexHost": {
                  "clusterName": "",
                  "envName": ""
              },
              "reflexLabels": {
                  "agentVersion": "",
                  "cluster": "",
                  "env": "",
                  "projectName": ""
              }
          },
          "unionAudit": {
              "enabled": true,
              "kafkaBrokers": null
          }
      }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function useMockUpdateOttSettings() {
  async function mutateAsync(args: UpdateOttParamsInput): Promise<void> {
    await wait(400);
    console.log("updateOttParams payload:", args);
  }

  return { mutateAsync };
}

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const { mutateAsync: updateOttParams } = useMockUpdateOttSettings();
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
  const saveFlowRunner = useSwitchSaveFlowRunner({
    serviceId: "demo-service",
    env: "dev",
    updateOttParams,
  });

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
        saveFlowRunner={saveFlowRunner}
      />
    </div>
  );
}

export default App;
