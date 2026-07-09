import { describe, expect, it } from "vitest";
import {
  normalizeAIRecords,
  normalizeLead,
} from "../../src/services/aiService.js";

describe("normalizeLead", () => {
  it("removes invalid date, status, and data source values", () => {
    const record = normalizeLead({
      created_at: "not a date",
      name: " Alice ",
      crm_status: "OPEN" as never,
      data_source: "facebook" as never,
    });

    expect(record).toMatchObject({
      name: "Alice",
      data_source: "",
      __skipped: false,
    });
    expect(record.created_at).toBeUndefined();
    expect(record.crm_status).toBeUndefined();
  });

  it("escapes line breaks in text fields", () => {
    const record = normalizeLead({
      crm_note: "Call today\nFollow up tomorrow",
    });

    expect(record.crm_note).toBe("Call today\\nFollow up tomorrow");
  });
});

describe("normalizeAIRecords", () => {
  it("trims extra AI records and fills missing rows as skipped", () => {
    const rawRows = [
      { name: "A", email: "a@example.com" },
      { name: "B", email: "b@example.com" },
    ];

    const records = normalizeAIRecords(rawRows, [
      { name: "A", email: "a@example.com" },
      { name: "extra", email: "extra@example.com" },
      { name: "too much", email: "too-much@example.com" },
    ]);

    expect(records).toHaveLength(2);
    expect(records[0]?.name).toBe("A");
    expect(records[1]?.name).toBe("extra");

    const missingRecords = normalizeAIRecords(rawRows, [
      { name: "A", email: "a@example.com" },
    ]);

    expect(missingRecords).toHaveLength(2);
    expect(missingRecords[1]).toMatchObject({
      __skipped: true,
      __skip_reason: "AI response did not include this input row.",
    });
  });
});
