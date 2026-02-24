import type { SaveBlockResult, SaveBlockRunner, SaveFlowResult } from "./interfaces";

/**
 * Возвращает имя верхнеуровневого блока для трассировки и ошибок.
 */
function getBlockName(block: Record<string, unknown>): string {
  const [blockName] = Object.keys(block);
  return blockName ?? "unknown-block";
}

/**
 * Последовательно вызывает runner для каждого изменённого блока
 * и собирает единый результат для UI (успех/ошибки).
 */
export async function runSaveFlow(
  changedBlocks: Record<string, unknown>[],
  runner: SaveBlockRunner,
): Promise<SaveFlowResult> {
  const results: SaveBlockResult[] = [];

  for (const [blockIndex, block] of changedBlocks.entries()) {
    const result = await runner({
      block,
      blockIndex,
      totalBlocks: changedBlocks.length,
    });
    results.push(result);
  }

  const errors = results.filter((result) => !result.ok).map((result) => result.error);

  return {
    isSuccess: errors.length === 0,
    results,
    errors,
  };
}

/**
 * Создаёт успешный результат для одного блока.
 */
export function createSaveSuccess(block: Record<string, unknown>): SaveBlockResult {
  return {
    ok: true,
    blockName: getBlockName(block),
  };
}
