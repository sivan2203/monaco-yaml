import type { OnMount } from "@monaco-editor/react";

export type Theme = "dark" | "light";

export function getMonacoTheme(theme: Theme): string {
  return theme === "dark" ? "vs-dark" : "vs";
}

export interface DisabledBlock {
  name: string;
  fullText: string;
  reason: "disabled" | "deleted";
}

export interface EditorProblem {
  source: "validation" | "backend";
  severity: "error" | "warning" | "info";
  message: string;
  startLineNumber?: number;
  startColumn?: number;
}

export interface YamlEditorResult {
  defaultValue: string;
  handleEditorMount: OnMount;
  errorCount: number;
  problems: EditorProblem[];
  disabledBlocks: DisabledBlock[];
  handleEnableBlock: (block: DisabledBlock) => void;
  getFullYaml: () => string;
  initialYaml: string;
  revealLine: (line: number) => void;
}

export interface YamlConfigEditorProps {
  yamlConfig: string;
  schema: Record<string, unknown>;
  theme?: Theme;
  backendProblems?: EditorProblem[];
  onSave?: (changedBlocks: Record<string, unknown>[]) => void;
  onCancel?: () => void;
}
