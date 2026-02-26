export interface JsonSchemaProperty {
  type?: string;
  default?: unknown;
  properties?: Record<string, JsonSchemaProperty>;
}

export interface JsonSchemaObject {
  properties?: Record<string, JsonSchemaProperty>;
}

export interface BackendConfigResponse {
  data?: {
    serviceSettings?: Record<string, unknown>;
    schema?: Record<string, unknown>;
  };
  serviceSettings?: Record<string, unknown>;
  schema?: Record<string, unknown>;
}

export interface GenerateYamlInput {
  serviceSettings: Record<string, unknown>;
}
