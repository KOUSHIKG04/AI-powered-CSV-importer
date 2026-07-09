import { mapBatchWithAI } from "./aiService.js";
import { getConfiguredBatchSize } from "./batchService.js";
import type {
  BatchProgress,
  CRMLead,
  ImportSummary,
  RawCsvRecord,
} from "../types/crm.js";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createImportSummary(records: CRMLead[]): ImportSummary {
  const skipped = records.filter((record) => record.__skipped).length;

  return {
    total: records.length,
    imported: records.length - skipped,
    skipped,
  };
}

export async function mapBatchWithRetries(
  batch: RawCsvRecord[],
): Promise<CRMLead[]> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await mapBatchWithAI(batch);
    } catch (error: unknown) {
      attempt++;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `Batch mapping attempt ${attempt} failed. Retrying... Error: ${message}`,
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  return batch.map(() => ({
    __skipped: true,
    __skip_reason: "AI processing failed after multiple retries.",
  }));
}

export async function processRecordsInBatches(
  records: RawCsvRecord[],
  onBatch?: (progress: BatchProgress) => void,
): Promise<CRMLead[]> {
  const batchSize = getConfiguredBatchSize();
  const totalRecords = records.length;
  const allMappedRecords: CRMLead[] = [];
  let processedRecords = 0;

  for (let startIndex = 0; startIndex < totalRecords; startIndex += batchSize) {
    const batch = records.slice(startIndex, startIndex + batchSize);
    const mappedBatch = await mapBatchWithRetries(batch);

    allMappedRecords.push(...mappedBatch);
    processedRecords += batch.length;

    const summary = createImportSummary(allMappedRecords);
    const progress =
      totalRecords === 0
        ? 100
        : Math.round((processedRecords / totalRecords) * 100);

    onBatch?.({
      ...summary,
      records: mappedBatch,
      progress,
      processed: processedRecords,
    });
  }

  return allMappedRecords;
}
