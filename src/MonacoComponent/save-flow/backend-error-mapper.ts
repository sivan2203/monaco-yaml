import type { EditorProblem } from "../types";
import type { SaveFlowError } from "./interfaces";

/**
 * Преобразует ошибки save-flow в формат панели проблем редактора.
 */
export function mapSaveErrorsToBackendProblems(saveErrors: SaveFlowError[]): EditorProblem[] {
  return saveErrors.map((saveError) => ({
    source: "backend",
    severity: "error",
    message: `[${saveError.blockName}] ${saveError.message}`,
    startLineNumber: saveError.startLineNumber,
    startColumn: saveError.startColumn,
  }));
}
