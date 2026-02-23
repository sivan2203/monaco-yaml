import type { BackendConfigResponse, JsonSchemaObject } from "./config-data.interface";

interface ResolveSchemaInput {
  backendSchema?: Record<string, unknown>;
  fallbackSchema: Record<string, unknown>;
}

/**
 * Возвращает схему для редактора:
 * приоритет у схемы с бэкенда, иначе используется локальный fallback.
 */
export function resolveSchemaForEditor(input: ResolveSchemaInput): JsonSchemaObject {
  if (isSchemaObject(input.backendSchema)) return input.backendSchema;
  if (isSchemaObject(input.fallbackSchema)) return input.fallbackSchema;
  return {};
}

/**
 * Извлекает serviceSettings из типового backend-ответа.
 * Поддерживает как корневой формат, так и формат response.data.serviceSettings.
 */
export function extractServiceSettings(response: BackendConfigResponse): Record<string, unknown> {
  const fromRoot = response.serviceSettings;
  if (isRecord(fromRoot)) return fromRoot;

  const fromData = response.data?.serviceSettings;
  if (isRecord(fromData)) return fromData;

  return {};
}

/**
 * Извлекает JSON Schema из backend-ответа.
 * Поддерживает как корневой формат, так и формат response.data.schema.
 */
export function extractSchemaFromResponse(
  response: BackendConfigResponse,
): Record<string, unknown> | undefined {
  const fromRoot = response.schema;
  if (isSchemaObject(fromRoot)) return fromRoot;

  const fromData = response.data?.schema;
  if (isSchemaObject(fromData)) return fromData;

  return undefined;
}

/**
 * Узкий type-guard для схемы: в текущем модуле достаточно проверки на object.
 */
function isSchemaObject(value: unknown): value is JsonSchemaObject {
  return isRecord(value);
}

/**
 * Проверяет, что значение является plain-object (не null и не массив).
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
