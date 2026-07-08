import type { Request, Response } from "express";
import { parseCsv } from "../utils/csvParser.js";
import { mapBatchWithAI, type CRMLead } from "../services/aiService.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const BATCH_SIZE = 30;
const MAX_RETRIES = 3;

type RawCsvRecord = Record<string, string>;

interface BatchProgress {
  records: CRMLead[];
  progress: number;
  processed: number;
  total: number;
}

export async function parseCsvHandler(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No CSV file uploaded.",
      });
    }

    const rawRows = await parseCsv(req.file.buffer);
    const headers = Object.keys(rawRows[0] ?? {});

    return res.status(200).json({
      success: true,
      headers,
      rows: rawRows,
      total: rawRows.length,
    });
  } catch (error: unknown) {
    console.error("CSV Parse Handler Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      error: `Failed to parse CSV file: ${message}`,
    });
  }
}

async function mapBatchWithRetries(batch: RawCsvRecord[]): Promise<CRMLead[]> {
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
        await sleep(1500);
      }
    }
  }

  return batch.map((row) => ({
    ...row,
    __skipped: true,
    __skip_reason: "AI processing failed after multiple retries.",
  }));
}

async function processRecordsInBatches(
  records: RawCsvRecord[],
  onBatch?: (progress: BatchProgress) => void,
): Promise<CRMLead[]> {
  const allMappedRecords: CRMLead[] = [];
  let processedCount = 0;
  const totalRecords = records.length;

  for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const mappedRecords = await mapBatchWithRetries(batch);

    processedCount += batch.length;
    allMappedRecords.push(...mappedRecords);

    onBatch?.({
      records: mappedRecords,
      progress:
        totalRecords === 0
          ? 100
          : Math.round((processedCount / totalRecords) * 100),
      processed: processedCount,
      total: totalRecords,
    });
  }

  return allMappedRecords;
}

export async function importCsvHandler(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No CSV file uploaded.",
      });
    }

    const rawRows = await parseCsv(req.file.buffer);
    const mappedRecords = await processRecordsInBatches(rawRows);
    const skipped = mappedRecords.filter((record) => record.__skipped).length;

    return res.status(200).json({
      success: true,
      headers: Object.keys(rawRows[0] ?? {}),
      sourceRows: rawRows.length,
      records: mappedRecords,
      total: mappedRecords.length,
      imported: mappedRecords.length - skipped,
      skipped,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      error: `Failed to import CSV file: ${message}`,
    });
  }
}

export async function importStreamHandler(
  req: Request,
  res: Response,
): Promise<void | Response> {
  const { records } = req.body as { records?: RawCsvRecord[] };

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({
      success: false,
      error: "Invalid input. Expected a JSON body with a 'records' array.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache");

  res.flushHeaders();

  try {
    await processRecordsInBatches(records, (progressData) => {
      res.write(
        `data: ${JSON.stringify({ type: "batch_result", ...progressData })}\n\n`,
      );
    });

    res.write(
      `data: ${JSON.stringify({
        type: "done",
        message: "AI CSV Import completed successfully.",
      })}\n\n`,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.write(
      `data: ${JSON.stringify({ type: "error", error: message })}\n\n`,
    );
  } finally {
    res.end();
  }
}
