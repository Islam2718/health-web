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

// ---------------------------------------------------------------------------
// Admin (Bearer-authenticated) CRUD for both resources. A medicine always
// belongs to a company via company_id, so the company side is managed first.
//
// The docs' response schema panels for medicine-companies.index/store/show
// and medicines.index/store/show all render as a bare `data: string` — the
// same broken/collapsed-schema rendering quirk seen elsewhere in this API's
// docs (no real response sample was available to double check). Modeled
// below as `{ data: Resource }` / `{ data: Resource[] }`, matching the
// convention used by every other confirmed resource in this API.
// ---------------------------------------------------------------------------

export interface MedicineCompanyPayload {
  name: string;
  logo?: string;
  address?: string;
  license_number?: string;
  about?: string;
}

export async function fetchMedicineCompanies(
  token: string
): Promise<{ companies: MedicineCompany[]; failed: boolean }> {
  try {
    const res = await apiFetch<{ data: MedicineCompany[] }>("/medicine-companies", { token });
    return { companies: res?.data ?? [], failed: false };
  } catch {
    return { companies: [], failed: true };
  }
}

export async function fetchMedicineCompany(token: string, id: number | string): Promise<MedicineCompany | null> {
  try {
    const res = await apiFetch<{ data: MedicineCompany }>(`/medicine-companies/${id}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function createMedicineCompany(
  token: string,
  payload: MedicineCompanyPayload
): Promise<MedicineCompany> {
  const res = await apiFetch<{ message: string; data: MedicineCompany }>("/medicine-companies", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function updateMedicineCompany(
  token: string,
  id: number | string,
  payload: MedicineCompanyPayload
): Promise<MedicineCompany> {
  const res = await apiFetch<{ message: string; data: MedicineCompany }>(`/medicine-companies/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return res.data;
}

export async function deleteMedicineCompany(token: string, id: number | string): Promise<void> {
  await apiFetch<{ message: string }>(`/medicine-companies/${id}`, { method: "DELETE", token });
}

export interface MedicinePayload {
  name: string;
  generic_name?: string;
  weight?: string;
  suggestion_price?: number;
  type?: string;
  description?: string;
  company_id: number;
}

export async function fetchMedicines(token: string): Promise<{ medicines: PublicMedicineRecord[]; failed: boolean }> {
  try {
    const res = await apiFetch<{ data: PublicMedicineRecord[] }>("/medicines", { token });
    return { medicines: res?.data ?? [], failed: false };
  } catch {
    return { medicines: [], failed: true };
  }
}

export async function fetchMedicine(token: string, id: number | string): Promise<PublicMedicineRecord | null> {
  try {
    const res = await apiFetch<{ data: PublicMedicineRecord }>(`/medicines/${id}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function createMedicine(token: string, payload: MedicinePayload): Promise<PublicMedicineRecord> {
  const res = await apiFetch<{ message: string; data: PublicMedicineRecord }>("/medicines", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function updateMedicine(
  token: string,
  id: number | string,
  payload: MedicinePayload
): Promise<PublicMedicineRecord> {
  const res = await apiFetch<{ message: string; data: PublicMedicineRecord }>(`/medicines/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return res.data;
}

export async function deleteMedicine(token: string, id: number | string): Promise<void> {
  await apiFetch<{ message: string }>(`/medicines/${id}`, { method: "DELETE", token });
}
