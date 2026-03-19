import type { SaveBlockResult, SaveBlockRunner, SaveFlowResult } from "./interfaces";

/**
 * Возвращает имя верхнеуровневого блока для трассировки и ошибок.
 */
function getBlockName(block: Record<string, unknown>): string {
  const [blockName] = Object.keys(block);
  return blockName ?? "unknown-block";
}

/**
 * Параллельно вызывает runner для каждого изменённого блока
 * и собирает единый результат для UI (успех/ошибки).
 * Все блоки обрабатываются независимо — ошибка одного не прерывает остальные.
 */
export async function runSaveFlow(
  changedBlocks: Record<string, unknown>[],
  runner: SaveBlockRunner,
): Promise<SaveFlowResult> {
  const settled = await Promise.allSettled(
    changedBlocks.map((block, blockIndex) =>
      runner({
        block,
        blockIndex,
        totalBlocks: changedBlocks.length,
      }),
    ),
  );

  const results: SaveBlockResult[] = settled.map((outcome, i) => {
    if (outcome.status === "fulfilled") return outcome.value;
    return {
      ok: false,
      error: {
        blockName: getBlockName(changedBlocks[i]),
        message: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      },
    } satisfies SaveBlockResult;
  });

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
