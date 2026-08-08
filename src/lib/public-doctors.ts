import { apiFetch, type ApiUser } from "@/lib/api-client";

// Nested under a doctor's public profile (doctor.publicShow only, confirmed
// via a real response — not documented in the schema panel). consultation_fee
// comes back as a decimal *string* ("700.00") here, unlike the doctor's own
// /chambers and /doctor-schedules endpoints which return numbers.
export interface PublicDoctorScheduleRecord {
  id: number;
  chamber_id: number;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: number | null;
  max_patients: number | null;
  consultation_fee: string | number | null;
  is_active: boolean;
}

export interface PublicChamberRecord {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  consultation_fee: string | number | null;
  is_active: boolean;
  doctor_schedules: PublicDoctorScheduleRecord[];
}

export interface PublicDoctorRecord {
  id: number;
  user_id: number;
  title: string | null;
  specialization: string | null;
  license_number: string | null;
  registration_year: string | null;
  bio: string | null;
  is_active: boolean | number;
  created_at: string | null;
  updated_at: string | null;
  // Confirmed present on the real response even though the docs screenshot
  // didn't render it — the nested account behind this doctor listing.
  user?: ApiUser | null;
  // Confirmed present on doctor.publicShow; not confirmed on the list
  // endpoint, so treat as optional everywhere.
  chambers?: PublicChamberRecord[];
}

export interface PublicDoctorListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FetchPublicDoctorsParams {
  search?: string;
  department?: string;
  designation?: string;
  address?: string;
  per_page?: number;
  page?: number;
  random?: boolean;
}

function buildQuery(params: FetchPublicDoctorsParams): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.department) q.set("department", params.department);
  if (params.designation) q.set("designation", params.designation);
  if (params.address) q.set("address", params.address);
  if (params.per_page) q.set("per_page", String(params.per_page));
  if (params.page) q.set("page", String(params.page));
  if (params.random) q.set("random", "1");
  const s = q.toString();
  return s ? `?${s}` : "";
}

// Both endpoints are public (no Bearer token) — used by the marketing-facing
// /doctors directory and /doctors/[id] profile pages.
export async function fetchPublicDoctors(
  params: FetchPublicDoctorsParams = {}
): Promise<{ doctors: PublicDoctorRecord[]; meta: PublicDoctorListMeta | null }> {
  try {
    const res = await apiFetch<{ data: PublicDoctorRecord[]; meta?: PublicDoctorListMeta }>(
      `/doctors/public${buildQuery(params)}`
    );
    return { doctors: res?.data ?? [], meta: res?.meta ?? null };
  } catch {
    return { doctors: [], meta: null };
  }
}

export async function fetchPublicDoctor(id: string | number): Promise<PublicDoctorRecord | null> {
  try {
    const res = await apiFetch<{ data: PublicDoctorRecord }>(`/doctors/public/${id}`);
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export function doctorDisplayName(doctor: PublicDoctorRecord): string {
  return doctor.user?.name?.trim() || "Doctor";
}

export function doctorTitleLine(doctor: PublicDoctorRecord): string {
  return [doctor.title, doctor.specialization].filter(Boolean).join(" · ");
}

// No live "departments" endpoint is documented — these seed the filter pills
// and are sent through as the free-text `department` query param.
export const commonSpecialties = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "Gynecology",
  "Dentistry",
  "ENT",
  "General Physician",
  "Psychiatry",
];
