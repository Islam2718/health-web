import { apiFetch } from "@/lib/api-client";

// The authenticated Ambulance domain — a user registers and manages their
// own ambulance vehicle(s) (multiple entries, same "add as many as you
// like" CRUD shape already used for a doctor's education/experience
// entries). Distinct from the mock src/lib/ambulances-data.ts, which still
// powers the public /ambulances directory and the admin mock panel.

export type AmbulanceType = "AC" | "NonAC" | "AIR" | "Freeze";

export interface AmbulanceOwner {
  id: number;
  name: string;
  phone: string | null;
}

// The docs' response schema panel types id/is_active as "string" with no
// real sample response to confirm it (only auto-generated placeholder
// "string" values in the request example) — same doc-generation quirk seen
// elsewhere in this API. Modeled here following the actual Laravel
// convention confirmed everywhere else (numeric auto-increment ids, boolean
// flags), not the schema panel.
export interface AmbulanceRecord {
  id: number;
  brand_model: string | null;
  license_plate_number: string;
  phone_number: string;
  ambulance_type: AmbulanceType | null;
  equipment_list: string[] | null;
  description: string | null;
  address: string | null;
  is_active: boolean;
  owner?: AmbulanceOwner;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AmbulancePayload {
  brand_model?: string | null;
  license_plate_number: string;
  phone_number: string;
  ambulance_type?: AmbulanceType | null;
  equipment_list?: string[] | null;
  description?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export const AMBULANCE_TYPE_OPTIONS: { value: AmbulanceType; label: string }[] = [
  { value: "AC", label: "AC" },
  { value: "NonAC", label: "Non-AC" },
  { value: "AIR", label: "Air Ambulance" },
  { value: "Freeze", label: "Freezer / Mortuary" },
];

// No "my-ambulances" endpoint exists — GET /ambulances (Bearer auth) is used
// directly. The response includes a nested `owner`, which only makes sense
// if this list is already scoped to what the authenticated caller can
// manage, the same assumption already proven correct for the doctor's own
// chambers/schedules via their equivalent authenticated index endpoints.
export async function fetchMyAmbulances(token: string): Promise<AmbulanceRecord[]> {
  try {
    const res = await apiFetch<{ data: AmbulanceRecord[] }>("/ambulances", { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function createAmbulance(token: string, payload: AmbulancePayload): Promise<AmbulanceRecord> {
  const res = await apiFetch<{ message: string; data: AmbulanceRecord }>("/ambulances", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function updateAmbulance(
  token: string,
  id: number,
  payload: AmbulancePayload
): Promise<AmbulanceRecord> {
  const res = await apiFetch<{ message: string; data: AmbulanceRecord }>(`/ambulances/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return res.data;
}

export async function deleteAmbulance(token: string, id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/ambulances/${id}`, { method: "DELETE", token });
}

// Public, no-auth directory + detail — powers /ambulances. Confirmed via
// real response samples: unlike the authenticated AmbulanceResource above,
// there's no is_active flag here, and the nested owner additionally carries
// address/profile_image. There's also no live status/ETA/rating/fare field
// at all — those were mock-only; the UI built on this can't show them.
export interface PublicAmbulanceOwner {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  profile_image: string | null;
}

export interface PublicAmbulanceRecord {
  id: number;
  brand_model: string | null;
  license_plate_number: string;
  phone_number: string;
  ambulance_type: AmbulanceType | null;
  equipment_list: string[] | null;
  description: string | null;
  address: string | null;
  owner: PublicAmbulanceOwner;
}

interface PublicAmbulanceIndexResponse {
  data: PublicAmbulanceRecord[];
  meta?: { current_page: number; last_page: number; total: number; per_page: number };
}

// No search/type query params are documented, so this fetches a large page
// and filters client-side — same tradeoff already accepted for the public
// blood donor directory. A pool past the first 100 won't show up here.
export async function fetchPublicAmbulances(): Promise<{ ambulances: PublicAmbulanceRecord[]; failed: boolean }> {
  try {
    const res = await apiFetch<PublicAmbulanceIndexResponse>(`/ambulances/public?per_page=100`);
    return { ambulances: res?.data ?? [], failed: false };
  } catch {
    return { ambulances: [], failed: true };
  }
}

export async function fetchPublicAmbulance(id: number | string): Promise<PublicAmbulanceRecord | null> {
  try {
    const res = await apiFetch<{ data: PublicAmbulanceRecord }>(`/ambulances/public/${id}`);
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export function ambulanceTypeLabel(type: AmbulanceType | string | null): string | null {
  if (!type) return null;
  return AMBULANCE_TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type;
}
