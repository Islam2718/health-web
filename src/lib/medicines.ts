import { apiFetch } from "@/lib/api-client";

export interface MedicineCompany {
  id: number;
  name: string;
  logo: string | null;
  address: string | null;
  license_number: string | null;
  about: string | null;
  office_phone: string | null;
  office_email: string | null;
  website: string | null;
}

export interface PublicMedicineRecord {
  id: number;
  name: string;
  generic_name: string | null;
  weight: string | null;
  suggestion_price: string | number | null;
  type: string | null;
  description: string | null;
  company_id: number | null;
  company?: MedicineCompany | null;
}

export interface FetchPublicMedicinesParams {
  search?: string;
  company_id?: number;
  type?: string;
  per_page?: number;
  random?: boolean;
}

function buildQuery(params: FetchPublicMedicinesParams): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.company_id) q.set("company_id", String(params.company_id));
  if (params.type) q.set("type", params.type);
  if (params.per_page) q.set("per_page", String(params.per_page));
  if (params.random) q.set("random", "1");
  const s = q.toString();
  return s ? `?${s}` : "";
}

// Public endpoint (no Bearer token) — the `search` query matches across
// name/generic_name/company per the API, so one field covers all three.
export async function fetchPublicMedicines(
  params: FetchPublicMedicinesParams = {}
): Promise<PublicMedicineRecord[]> {
  try {
    const res = await apiFetch<{ data: PublicMedicineRecord[] }>(`/medicines/public${buildQuery(params)}`);
    return res?.data ?? [];
  } catch {
    return [];
  }
}
