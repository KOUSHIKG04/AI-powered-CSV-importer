import { describe, expect, it } from "vitest";
import { parseCsv } from "../../src/utils/csvParser.js";

describe("parseCsv", () => {
  it("parses arbitrary CSV headers into records", async () => {
    const csv = [
      "Full Name,Primary Phone,Lead Source",
      "John Doe,9876543210,Facebook",
      "Jane Smith,9876543211,Google Ads",
    ].join("\n");

    const records = await parseCsv(Buffer.from(csv));

    expect(records).toEqual([
      {
        "Full Name": "John Doe",
        "Primary Phone": "9876543210",
        "Lead Source": "Facebook",
      },
      {
        "Full Name": "Jane Smith",
        "Primary Phone": "9876543211",
        "Lead Source": "Google Ads",
      },
    ]);
  });

  it("trims values and skips empty lines", async () => {
    const csv = "name,email\n Alice , alice@example.com \n\n";

    const records = await parseCsv(Buffer.from(csv));

    expect(records).toEqual([
      {
        name: "Alice",
        email: "alice@example.com",
      },
    ]);
  });
});
