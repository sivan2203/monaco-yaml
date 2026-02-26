import { stringify } from "yaml";
import type {
  GenerateYamlInput,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./config-data.interface";

/**
 * Генерирует YAML-строку из backend-данных,
 * приводя структуру к шаблону JSON Schema.
 */
export function generateYamlFromConfigData(
  input: GenerateYamlInput,
  schema: JsonSchemaObject,
): string {
  const normalizedSettings = normalizeKeysDeep(input.serviceSettings);

  if (!isRecord(normalizedSettings)) return "";

  const schemaShapedSettings = applySchemaTemplate(normalizedSettings, schema);

  return stringify(schemaShapedSettings, { indent: 2 }).trim();
}

/**
 * Формирует объект в порядке и структуре schema.properties.
 * Сначала укладывает известные схеме поля, затем добавляет остальные поля из source.
 */
function applySchemaTemplate(
  source: Record<string, unknown>,
  schema: JsonSchemaObject | JsonSchemaProperty,
): Record<string, unknown> {
  const schemaProperties = schema.properties;
  if (!schemaProperties) return source;

  const result: Record<string, unknown> = {};

  for (const [schemaKey, schemaProperty] of Object.entries(schemaProperties)) {
    const sourceValue = source[schemaKey];
    const normalizedValue = normalizeValueBySchema(sourceValue, schemaProperty);
    if (normalizedValue !== undefined) {
      result[schemaKey] = normalizedValue;
      continue;
    }

    const defaultValue = extractDefaultFromSchema(schemaProperty);
    if (defaultValue !== undefined) result[schemaKey] = defaultValue;
  }

  for (const [sourceKey, sourceValue] of Object.entries(source)) {
    if (sourceKey in result) continue;
    result[sourceKey] = sourceValue;
  }

  return result;
}

/**
 * Нормализует значение конкретного поля по под-схеме:
 * - скаляры возвращает как есть;
 * - объекты рекурсивно приводит к вложенному шаблону schema.properties.
 */
function normalizeValueBySchema(
  value: unknown,
  schemaProperty: JsonSchemaProperty,
): unknown {
  if (value === null || value === undefined) return undefined;

  if (!isRecord(value)) return value;

  if (!schemaProperty.properties) return value;

  return applySchemaTemplate(value, schemaProperty);
}

/**
 * Извлекает default-значение из поля схемы.
 * Если поле вложенное, рекурсивно собирает дефолты дочерних полей.
 */
function extractDefaultFromSchema(schemaProperty: JsonSchemaProperty): unknown {
  if (schemaProperty.default !== undefined) return schemaProperty.default;

  if (!schemaProperty.properties) return undefined;

  const nestedDefaults: Record<string, unknown> = {};
  let hasDefaults = false;

  for (const [key, nestedProperty] of Object.entries(schemaProperty.properties)) {
    const nestedDefault = extractDefaultFromSchema(nestedProperty);
    if (nestedDefault === undefined) continue;
    nestedDefaults[key] = nestedDefault;
    hasDefaults = true;
  }

  if (!hasDefaults) return undefined;
  return nestedDefaults;
}

/**
 * Рекурсивно клонирует структуру данных.
 * Работает для объектов любой вложенности и для элементов массивов.
 */
function normalizeKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => normalizeKeysDeep(item));
  if (!isRecord(value)) return value;

  const normalized: Record<string, unknown> = {};

  for (const [rawKey, rawValue] of Object.entries(value)) {
    normalized[rawKey] = normalizeKeysDeep(rawValue);
  }

  return normalized;
}

/**
 * Проверяет, что значение является plain-object (не null и не массив).
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
