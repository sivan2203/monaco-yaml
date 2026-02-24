import type { SaveBlockRunner, SaveFlowError } from "./interfaces";
import { createSaveSuccess } from "./run-save-flow";

const MOCK_DELAY_MS = 500;
const MOCK_RESPONSE_MODE: "always-fail" | "selective-fail" | "always-success" = "always-fail";
const MOCK_FAIL_BLOCKS = new Set(["dynatrace", "fluentbit"]);

/**
 * Возвращает имя верхнеуровневого блока из payload.
 */
function getBlockName(block: Record<string, unknown>): string {
  const [blockName] = Object.keys(block);
  return blockName ?? "unknown-block";
}

/**
 * Имитирует сетевую задержку, чтобы UI отрабатывал as-is.
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Формирует стабильную mock-ошибку, которую потом можно показать как backend проблему.
 */
function createMockError(blockName: string): SaveFlowError {
  return {
    blockName,
    message: `Не удалось обновить блок "${blockName}" на backend. Повторите сохранение.`,
  };
}

/**
 * Тестовый runner: выполняется как будущий hook-запрос для одного блока.
 * Сейчас это Promise-имитация, позже контракт можно связать с реальными хуками.
 */
export const mockBlockRunner: SaveBlockRunner = async ({ block }) => {
  const blockName = getBlockName(block);
  await wait(MOCK_DELAY_MS);

  /**
   * Имитирует ответ backend после отправки:
   * - always-fail: ошибка для каждого изменённого блока;
   * - selective-fail: ошибка только для выбранных блоков;
   * - always-success: все блоки обновляются успешно.
   */
  if (MOCK_RESPONSE_MODE === "always-fail")
    return {
      ok: false,
      error: createMockError(blockName),
    };

  if (MOCK_RESPONSE_MODE === "selective-fail" && MOCK_FAIL_BLOCKS.has(blockName))
    return {
      ok: false,
      error: createMockError(blockName),
    };

  return createSaveSuccess(block);
};
