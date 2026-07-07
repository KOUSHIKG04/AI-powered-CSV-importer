import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export interface CRMLead {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?:
    | "GOOD_LEAD_FOLLOW_UP"
    | "DID_NOT_CONNECT"
    | "BAD_LEAD"
    | "SALE_DONE";
  crm_note?: string;
  data_source?:
    | "leads_on_demand"
    | "meridian_tower"
    | "eden_park"
    | "varah_swamy"
    | "sarjapur_plots"
    | "";
  possession_time?: string;
  description?: string;
  __skipped?: boolean; // internal flag: set true if record must be skipped
  __skip_reason?: string; // internal reason for skipping
}

interface AIMappingResponse {
  records: CRMLead[];
}


export async function mapBatchWithAI(
  rawRows: Record<string, string>[],
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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON output from the Gemini model
    const parsedData: AIMappingResponse = JSON.parse(responseText);
    return parsedData.records || [];
  } catch (error: any) {
    console.error("Gemini Mapping Error:", error);
    throw new Error(`AI mapping failed: ${error.message}`);
  }
}
