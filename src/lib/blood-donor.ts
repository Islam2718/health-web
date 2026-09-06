import { apiFetch } from "@/lib/api-client";

// The Blood Donor domain: the authenticated side (opting in/out as a donor,
// logging a donation, viewing your own donation history) plus the public,
// no-auth directory (fetchPublicBloodDonors/fetchPublicBloodDonor) below.

export interface BloodDonorListEntry {
  id: number;
  name: string;
  gender: string | null;
  blood_group: string | null;
  address: string | null;
  donor_interest: boolean;
}

interface BloodDonorIndexResponse {
  data: BloodDonorListEntry[];
  meta?: { current_page: number; last_page: number; total: number };
}

// No dedicated "my donor status" endpoint exists — PATCH /blood-donors/interest
// only echoes back what you just set, it doesn't tell you what it *was* on
// page load. So this looks the current user up in the authenticated donor
// list instead. Capped at 100 entries (per_page=100); a user past the first
// page won't be found — same tradeoff already accepted for `myPosts` above,
// where there's likewise no dedicated "mine" endpoint.
export async function fetchMyDonorInterest(token: string, userId: number): Promise<boolean> {
  try {
    const res = await apiFetch<BloodDonorIndexResponse>(`/blood-donors?per_page=100`, { token });
    return res?.data?.find((d) => d.id === userId)?.donor_interest ?? false;
  } catch {
    return false;
  }
}

export async function updateDonorInterest(token: string, donor_interest: boolean): Promise<boolean> {
  const res = await apiFetch<{ message: string; data: { donor_interest: boolean } }>(
    "/blood-donors/interest",
    { method: "PATCH", token, body: { donor_interest } }
  );
  return res.data.donor_interest;
}

export type DonationPatientGender = "Male" | "Female" | "Other";

export interface CreateDonationPayload {
  patient_name: string;
  patient_gender?: DonationPatientGender;
  patient_disease?: string;
  patient_blood_group?: string;
  donation_date: string; // ISO date-time
  hospital_name?: string;
  hospital_address?: string;
  units: number;
  notes?: string;
}

// The docs' response schema panel oddly typed id/donor_user_id/units as
// "string" while the request examples on the same page use real integers
// (units: 1) — the same doc-generation inconsistency already seen elsewhere
// in this API (e.g. appointments' fee/consultation_fee). Modeled as numbers
// here, matching the request-body types, not the response panel.
export interface BloodDonationRecord {
  id: number;
  donor_user_id: number;
  patient_name: string;
  patient_gender: string | null;
  patient_disease: string | null;
  patient_blood_group: string | null;
  donation_date: string;
  hospital_name: string | null;
  hospital_address: string | null;
  units: number;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function createDonation(
  token: string,
  payload: CreateDonationPayload
): Promise<BloodDonationRecord> {
  const res = await apiFetch<{ data: BloodDonationRecord }>("/blood-donations", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function fetchMyDonations(token: string): Promise<BloodDonationRecord[]> {
  try {
    const res = await apiFetch<{ data: BloodDonationRecord[] }>("/my-blood-donations", { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

// Public, no-auth directory + detail — powers /blood-donors and
// /blood-donors/[id]. Confirmed via real response samples: unlike the
// ambulance domain, the show endpoint here returns strictly more than the
// list — a phone number and this donor's donation history — so a dedicated
// detail page is actually worth building (the list alone has neither).
export interface PublicBloodDonor {
  id: number;
  name: string;
  gender: string | null;
  blood_group: string | null;
  address: string | null;
  donor_interest: boolean;
}

// Same shape as the authenticated BloodDonationRecord, just reached via the
// public donor-detail endpoint instead of /my-blood-donations.
export interface PublicBloodDonation {
  id: number;
  donor_user_id: number;
  patient_name: string;
  patient_gender: string | null;
  patient_disease: string | null;
  patient_blood_group: string | null;
  donation_date: string;
  hospital_name: string | null;
  hospital_address: string | null;
  units: number;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PublicBloodDonorDetail extends PublicBloodDonor {
  phone: string | null;
  blood_donations: PublicBloodDonation[];
}

interface PublicBloodDonorIndexResponse {
  data: PublicBloodDonor[];
  meta?: { current_page: number; last_page: number; total: number; per_page: number };
}

// No search/blood_group query params are documented, so this fetches a
// large page and filters client-side — same "no dedicated filter, fetch
// broad" tradeoff already accepted for fetchMyDonorInterest above. A donor
// pool past the first 100 won't show up here.
export async function fetchPublicBloodDonors(): Promise<{ donors: PublicBloodDonor[]; failed: boolean }> {
  try {
    const res = await apiFetch<PublicBloodDonorIndexResponse>(`/blood-donors/public?per_page=100`);
    return { donors: res?.data ?? [], failed: false };
  } catch {
    return { donors: [], failed: true };
  }
}

export async function fetchPublicBloodDonor(id: number | string): Promise<PublicBloodDonorDetail | null> {
  try {
    const res = await apiFetch<{ data: PublicBloodDonorDetail }>(`/blood-donors/public/${id}`);
    return res?.data ?? null;
  } catch {
    return null;
  }
}

// Sample responses show inconsistent casing ("Male" vs "MALE") — normalize
// for display.
export function normalizeGenderLabel(gender: string | null): string | null {
  if (!gender) return null;
  const g = gender.trim().toLowerCase();
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  if (g === "other") return "Other";
  return gender;
}
