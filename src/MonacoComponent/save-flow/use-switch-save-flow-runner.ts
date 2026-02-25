import { useCallback } from "react";
import type { SaveBlockRunner, SaveFlowError } from "./interfaces";
import { createSaveSuccess } from "./run-save-flow";
import { mockBlockRunner } from "./mock-block-runner";

export interface UpdateOttParamsInput {
  serviceId: string;
  env: string;
  jsonData: Record<string, unknown>;
}

export interface UseSwitchSaveFlowRunnerParams {
  serviceId: string;
  env: string;
  updateOttParams: (args: UpdateOttParamsInput) => Promise<unknown>;
  fallbackRunner?: SaveBlockRunner;
}

/**
 * Возвращает имя верхнеуровневого блока из changedBlocks payload.
 */
function getBlockName(block: Record<string, unknown>): string {
  const [blockName] = Object.keys(block);
  return blockName ?? "unknown-block";
}

/**
 * Нормализует ошибку запроса в единый формат save-flow.
 */
function toSaveError(blockName: string, error: unknown): SaveFlowError {
  if (error instanceof Error)
    return {
      blockName,
      message: error.message,
    };

  return {
    blockName,
    message: `Не удалось сохранить блок "${blockName}"`,
  };
}

/**
 * Тестовый hook-runner с switch по имени блока.
 * Для неподдержанных блоков используется fallback (по умолчанию mock runner).
 */
export function useSwitchSaveFlowRunner({
  serviceId,
  env,
  updateOttParams,
  fallbackRunner = mockBlockRunner,
}: UseSwitchSaveFlowRunnerParams): SaveBlockRunner {
  return useCallback<SaveBlockRunner>(
    async (input) => {
      const { block } = input;
      const blockName = getBlockName(block);

      switch (blockName) {
        case "ott":
        case "ottParams": {
          const rawValue = block[blockName];
          const jsonData =
            rawValue != null && typeof rawValue === "object"
              ? (rawValue as Record<string, unknown>)
              : {};

          try {
            await updateOttParams({
              serviceId,
              env,
              jsonData,
            });

            return createSaveSuccess(block);
          } catch (error) {
            return {
              ok: false,
              error: toSaveError(blockName, error),
            };
          }
        }

        default:
          return fallbackRunner(input);
      }
    },
    [env, fallbackRunner, serviceId, updateOttParams],
  );
}
