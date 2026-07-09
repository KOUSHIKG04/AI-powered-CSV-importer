import type { Request } from "express";
import type { RawCsvRecord } from "../types/crm.js";

export class CsvValidationError extends Error {
  statusCode = 400;
}

export function getUploadedCsvFile(req: Request): Express.Multer.File {
  if (!req.file) {
    throw new CsvValidationError("No CSV file uploaded.");
  }

  return req.file;
}

export function getRawCsvRecordsFromBody(req: Request): RawCsvRecord[] {
  const { records } = req.body as { records?: unknown };

  if (!Array.isArray(records)) {
    throw new CsvValidationError(
      "Invalid input. Expected a JSON body with a 'records' array.",
    );
  }

  return records.map((record) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new CsvValidationError("Invalid input. Each record must be an object.");
    }

    return Object.fromEntries(
      Object.entries(record).map(([key, value]) => [
        key,
        value == null ? "" : String(value),
      ]),
    );
  });
}
