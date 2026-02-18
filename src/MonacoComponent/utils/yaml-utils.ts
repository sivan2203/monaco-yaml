import {
  parseDocument,
  Document,
  YAMLMap,
  type Pair,
  isMap,
  isScalar,
  visit,
} from "yaml";
import type { DisabledBlock } from "../types";

export function safeParseDocument(yaml: string): Document {
  const doc = parseDocument(yaml, { uniqueKeys: false, strict: false });
  doc.errors = [];
  return doc;
}

function pairToBlockYaml(pair: Pair): string {
  const tempDoc = new Document();
  tempDoc.contents = new YAMLMap();
  (tempDoc.contents as YAMLMap).items = [pair.clone()];
  return tempDoc.toString().trim();
}

function hasEnabledFalse(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  if (rec.enabled === false) return true;
  return Object.values(rec).some(hasEnabledFalse);
}

export function parseAndFilterYaml(yaml: string): {
  filteredYaml: string;
  disabledBlocks: DisabledBlock[];
} {
  const doc = safeParseDocument(yaml);

  const contents = doc.contents;
  if (!isMap(contents)) return { filteredYaml: yaml, disabledBlocks: [] };

  const disabledBlocks: DisabledBlock[] = [];
  const keysToRemove: string[] = [];
  const jsDoc = doc.toJS() as Record<string, unknown>;

  for (const item of contents.items) {
    const pair = item as Pair;
    const key = String(pair.key);
    if (hasEnabledFalse(jsDoc[key])) {
      disabledBlocks.push({
        name: key,
        fullText: pairToBlockYaml(pair),
        reason: "disabled",
      });
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) doc.delete(key);

  return {
    filteredYaml: doc.toString().trim(),
    disabledBlocks,
  };
}

export function buildFullYaml(
  editorContent: string,
  disabledBlocks: DisabledBlock[],
  originalKeyOrder: string[],
): string {
  const editorDoc = safeParseDocument(editorContent);

  const editorPairs = new Map<string, Pair>();
  if (isMap(editorDoc.contents)) {
    for (const item of editorDoc.contents.items) {
      const pair = item as Pair;
      editorPairs.set(String(pair.key), pair);
    }
  }

  const disabledPairs = new Map<string, Pair>();
  for (const block of disabledBlocks) {
    const blockDoc = safeParseDocument(block.fullText);
    if (isMap(blockDoc.contents)) {
      for (const item of blockDoc.contents.items) {
        const pair = item as Pair;
        disabledPairs.set(String(pair.key), pair);
      }
    }
  }

  const resultDoc = new Document();
  resultDoc.contents = new YAMLMap();
  const resultItems = (resultDoc.contents as YAMLMap).items;

  const placed = new Set<string>();

  for (const key of originalKeyOrder) {
    const pair = editorPairs.get(key) ?? disabledPairs.get(key);
    if (pair) {
      resultItems.push(pair);
      placed.add(key);
    }
  }

  for (const [key, pair] of editorPairs) {
    if (!placed.has(key)) resultItems.push(pair);
  }
  for (const [key, pair] of disabledPairs) {
    if (!placed.has(key)) resultItems.push(pair);
  }

  return resultDoc.toString().trim();
}

export function extractAllBlocks(yaml: string): Map<string, string> {
  const doc = safeParseDocument(yaml);
  const blocks = new Map<string, string>();
  const contents = doc.contents;
  if (!isMap(contents)) return blocks;

  for (const item of contents.items) {
    const pair = item as Pair;
    blocks.set(String(pair.key), pairToBlockYaml(pair));
  }

  return blocks;
}

export function setEnabledInBlock(blockYaml: string, value: boolean): string {
  const doc = safeParseDocument(blockYaml);
  visit(doc, {
    Pair(_, pair) {
      if (
        isScalar(pair.key) &&
        pair.key.value === "enabled" &&
        isScalar(pair.value)
      ) {
        pair.value.value = value;
        return visit.BREAK;
      }
    },
  });
  return doc.toString().trim();
}

function parseToJs(yaml: string): Record<string, unknown> {
  return (safeParseDocument(yaml).toJS() as Record<string, unknown>) ?? {};
}

export function getChangedBlocks(
  originalYaml: string,
  currentYaml: string,
): Record<string, unknown>[] {
  const orig = parseToJs(originalYaml);
  const curr = parseToJs(currentYaml);

  const allKeys = new Set([...Object.keys(orig), ...Object.keys(curr)]);
  const changed: Record<string, unknown>[] = [];

  for (const key of allKeys) {
    if (JSON.stringify(orig[key]) !== JSON.stringify(curr[key])) {
      changed.push({ [key]: curr[key] ?? null });
    }
  }

  return changed;
}
