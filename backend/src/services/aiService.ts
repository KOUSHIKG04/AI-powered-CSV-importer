import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import type { CRMLead, RawCsvRecord } from "../types/crm.js";

interface AIMappingResponse {
  records: CRMLead[];
}

const allowedStatuses = new Set([
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
]);

const allowedDataSources = new Set([
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
  "",
]);

let model: GenerativeModel | null = null;

function getModel() {
  if (model) return model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  return model;
}

export function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const cleaned = value.replace(/\r?\n/g, "\\n").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function normalizeLead(record: CRMLead): CRMLead {
  const crmStatus = cleanText(record.crm_status);
  const dataSource = cleanText(record.data_source) ?? "";
  const createdAt = cleanText(record.created_at);

  return {
    created_at:
      createdAt && !Number.isNaN(new Date(createdAt).getTime())
        ? createdAt
        : undefined,
    name: cleanText(record.name),
    email: cleanText(record.email),
    country_code: cleanText(record.country_code),
    mobile_without_country_code: cleanText(record.mobile_without_country_code),
    company: cleanText(record.company),
    city: cleanText(record.city),
    state: cleanText(record.state),
    country: cleanText(record.country),
    lead_owner: cleanText(record.lead_owner),
    crm_status: allowedStatuses.has(crmStatus ?? "")
      ? (crmStatus as CRMLead["crm_status"])
      : undefined,
    crm_note: cleanText(record.crm_note),
    data_source: allowedDataSources.has(dataSource)
      ? (dataSource as CRMLead["data_source"])
      : "",
    possession_time: cleanText(record.possession_time),
    description: cleanText(record.description),
    __skipped: record.__skipped === true,
    __skip_reason: cleanText(record.__skip_reason),
  };
}

function parseJsonResponse(responseText: string): AIMappingResponse {
  try {
    return JSON.parse(responseText) as AIMappingResponse;
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON.");
    }

    return JSON.parse(jsonMatch[0]) as AIMappingResponse;
  }
}

export function normalizeAIRecords(
  rawRows: RawCsvRecord[],
  records: CRMLead[],
): CRMLead[] {
  const normalizedRecords = records.slice(0, rawRows.length).map(normalizeLead);

  while (normalizedRecords.length < rawRows.length) {
    normalizedRecords.push({
      __skipped: true,
      __skip_reason: "AI response did not include this input row.",
    });
  }

  return normalizedRecords;
}

export async function mapBatchWithAI(
  rawRows: RawCsvRecord[],
): Promise<CRMLead[]> {
  const prompt = `
You are an expert CRM data engineer. Your task is to map and normalize a batch of messy CSV lead records into the CRM schema.

CRM Target Schema:
- created_at: Lead creation date. Format must be convertible using JavaScript: new Date(created_at) should be valid.
- name: Lead name.
- email: Primary email.
- country_code: Country code (e.g. +91, +1).
- mobile_without_country_code: Mobile number without country code.
- company: Company name.
- city: City name.
- state: State name.
- country: Country name.
- lead_owner: Lead owner email or ID (e.g., test@gmail.com).
- crm_status: Allowed values: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE". Map ambiguous statuses to these enums.
- crm_note: Remarks, follow-up notes, additional comments, extra phone numbers, extra email addresses, or any other useful info that does not fit another field.
- data_source: Allowed values: "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots". If none matches confidently, leave it empty.
- possession_time: Property possession time.
- description: Additional description.

Extraction guidance:
- Column names can be arbitrary. Infer fields from names, values, and context.
- Handle exports from Facebook Ads, Google Ads, real estate CRMs, marketing reports, sales spreadsheets, and manual sheets.
- Preserve useful source context in crm_note when a value does not belong to a dedicated target field.
- Return one output object for each input row, either mapped or skipped.

Rule 1 (Skip invalid records):
If a record contains NEITHER an email nor a mobile number (even after checking alternative column names like 'phone', 'mail', 'contact'), it MUST be skipped. Set "__skipped": true and "__skip_reason": "No email or mobile number found." in the JSON object.

Rule 2 (Multiple contacts):
If a row has multiple email addresses: set "email" to the first email, and append the remaining emails into "crm_note".
If a row has multiple mobile numbers: set "mobile_without_country_code" to the first mobile, and append the remaining numbers into "crm_note".

Rule 3 (CSV Compatibility):
Ensure everything is escaped correctly so it can form a single CSV row. Line breaks inside text must be replaced with escaped "\n".

Input Records (JSON format):
${JSON.stringify(rawRows, null, 2)}

Provide your response in JSON format matching this schema:
{
  "records": [
    // Array of objects matching CRM Schema + "__skipped" (boolean) and "__skip_reason" (string)
  ]
}
`;

  try {
    const result = await getModel().generateContent(prompt);
    const responseText = result.response.text();

    const parsedData = parseJsonResponse(responseText);
    return normalizeAIRecords(rawRows, parsedData.records || []);
  } catch (error: unknown) {
    console.error("Gemini Mapping Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`AI mapping failed: ${message}`);
  }
}
