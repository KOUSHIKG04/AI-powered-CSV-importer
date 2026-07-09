export type CRMStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE";

export type CRMDataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots"
  | "";

export type RawCsvRecord = Record<string, string>;

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
  crm_status?: CRMStatus;
  crm_note?: string;
  data_source?: CRMDataSource;
  possession_time?: string;
  description?: string;
  __skipped?: boolean;
  __skip_reason?: string;
}

export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
}

export interface BatchProgress extends ImportSummary {
  records: CRMLead[];
  progress: number;
  processed: number;
}
