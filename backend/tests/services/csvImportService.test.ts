import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createImportSummary,
  mapBatchWithRetries,
} from "../../src/services/csvImportService.js";
import { mapBatchWithAI } from "../../src/services/aiService.js";

vi.mock("../../src/services/aiService.js", () => ({
  mapBatchWithAI: vi.fn(),
}));

const mockedMapBatchWithAI = vi.mocked(mapBatchWithAI);

describe("csvImportService", () => {
  beforeEach(() => {
    mockedMapBatchWithAI.mockReset();
  });

  it("marks every row skipped after repeated AI failures", async () => {
    mockedMapBatchWithAI.mockRejectedValue(new Error("Gemini failed"));

    const records = await mapBatchWithRetries([
      { name: "No Contact" },
      { name: "Still No Contact" },
    ]);

    expect(mockedMapBatchWithAI).toHaveBeenCalledTimes(3);
    expect(records).toEqual([
      {
        __skipped: true,
        __skip_reason: "AI processing failed after multiple retries.",
      },
      {
        __skipped: true,
        __skip_reason: "AI processing failed after multiple retries.",
      },
    ]);
  });

  it("summarizes imported and skipped records", () => {
    expect(
      createImportSummary([
        { name: "Imported", email: "lead@example.com" },
        { __skipped: true, __skip_reason: "No email or mobile number found." },
      ]),
    ).toEqual({
      total: 2,
      imported: 1,
      skipped: 1,
    });
  });
});
