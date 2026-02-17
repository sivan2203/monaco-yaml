import type { RefObject } from "react";

export interface DisabledBlock {
  name: string;
  fullText: string;
  reason: "disabled" | "deleted";
}

export interface YamlEditorResult {
  containerRef: RefObject<HTMLDivElement | null>;
  errorCount: number;
  disabledBlocks: DisabledBlock[];
  handleEnableBlock: (block: DisabledBlock) => void;
}
