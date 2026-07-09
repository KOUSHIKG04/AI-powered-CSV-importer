import type { Request, Response } from "express";
import { parseCsv } from "../utils/csvParser.js";
import {
  createImportSummary,
  processRecordsInBatches,
} from "../services/csvImportService.js";
import {
  CsvValidationError,
  getRawCsvRecordsFromBody,
  getUploadedCsvFile,
} from "../validators/csvValidator.js";
import type { RawCsvRecord } from "../types/crm.js";

export async function parseCsvHandler(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const file = getUploadedCsvFile(req);
    const rawRows = await parseCsv(file.buffer);
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
    const statusCode = error instanceof CsvValidationError ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      error:
        error instanceof CsvValidationError
          ? message
          : `Failed to parse CSV file: ${message}`,
    });
  }
}

export async function importCsvHandler(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const file = getUploadedCsvFile(req);
    const rawRows = await parseCsv(file.buffer);
    const mappedRecords = await processRecordsInBatches(rawRows);
    const summary = createImportSummary(mappedRecords);

    return res.status(200).json({
      success: true,
      headers: Object.keys(rawRows[0] ?? {}),
      sourceRows: rawRows.length,
      records: mappedRecords,
      ...summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const statusCode = error instanceof CsvValidationError ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      error:
        error instanceof CsvValidationError
          ? message
          : `Failed to import CSV file: ${message}`,
    });
  }
}

export async function importStreamHandler(
  req: Request,
  res: Response,
): Promise<void | Response> {
  let records: RawCsvRecord[];

  try {
    records = getRawCsvRecordsFromBody(req);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid input.";
    return res.status(400).json({
      success: false,
      error: message,
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache");

  res.flushHeaders();

  try {
    const mappedRecords = await processRecordsInBatches(records, (progressData) => {
      res.write(
        `data: ${JSON.stringify({ type: "batch_result", ...progressData })}\n\n`,
      );
    });
    const summary = createImportSummary(mappedRecords);

    res.write(
      `data: ${JSON.stringify({
        type: "done",
        message: "AI CSV Import completed successfully.",
        ...summary,
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
