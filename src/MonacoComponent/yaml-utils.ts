import {
  parseDocument,
  Document,
  YAMLMap,
  type Pair,
  isMap,
} from "yaml";
import type { DisabledBlock } from "./types";

export function hasEnabledFalse(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  if (rec.enabled === false) return true;
  return Object.values(rec).some(hasEnabledFalse);
}

export function parseAndFilterYaml(yaml: string): {
  filteredYaml: string;
  disabledBlocks: DisabledBlock[];
} {
  const doc = parseDocument(yaml, { uniqueKeys: false, strict: false });
  doc.errors = [];

  const contents = doc.contents;
  if (!isMap(contents)) return { filteredYaml: yaml, disabledBlocks: [] };

  const disabledBlocks: DisabledBlock[] = [];
  const keysToRemove: string[] = [];
  const jsDoc = doc.toJS() as Record<string, unknown>;

  for (const item of contents.items) {
    const pair = item as Pair;
    const key = String(pair.key);
    const jsValue = jsDoc[key];
    if (hasEnabledFalse(jsValue)) {
      const tempDoc = new Document();
      tempDoc.contents = new YAMLMap();
      (tempDoc.contents as YAMLMap).items = [(pair as Pair).clone()];
      disabledBlocks.push({
        name: key,
        fullText: tempDoc.toString().trim(),
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

export function extractAllBlocks(yaml: string): Map<string, string> {
  const doc = parseDocument(yaml, { uniqueKeys: false, strict: false });
  doc.errors = [];
  const blocks = new Map<string, string>();
  const contents = doc.contents;
  if (!isMap(contents)) return blocks;

  for (const item of contents.items) {
    const pair = item as Pair;
    const key = String(pair.key);
    const tempDoc = new Document();
    tempDoc.contents = new YAMLMap();
    (tempDoc.contents as YAMLMap).items = [(pair as Pair).clone()];
    blocks.set(key, tempDoc.toString().trim());
  }

  return blocks;
}
