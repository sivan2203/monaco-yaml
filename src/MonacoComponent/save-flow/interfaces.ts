export interface SaveBlockRunnerInput {
  block: Record<string, unknown>;
  blockIndex: number;
  totalBlocks: number;
}

export interface SaveFlowError {
  blockName: string;
  message: string;
  startLineNumber?: number;
  startColumn?: number;
}

export interface SaveBlockSuccess {
  ok: true;
  blockName: string;
}

export interface SaveBlockFailure {
  ok: false;
  error: SaveFlowError;
}

export type SaveBlockResult = SaveBlockSuccess | SaveBlockFailure;

export type SaveBlockRunner = (input: SaveBlockRunnerInput) => Promise<SaveBlockResult>;

export interface SaveFlowResult {
  isSuccess: boolean;
  results: SaveBlockResult[];
  errors: SaveFlowError[];
}
