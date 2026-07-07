import { parse } from "csv-parse";

export function parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    parse(
      buffer,
      {
        columns: true, // Auto-detect column headers from the first row
        skip_empty_lines: true,
        trim: true,
      },
      (err, records) => {
        if (err) {
          reject(err);
        }

        return resolve(records as Record<string, string>[]);
      },
    );
  });
}
