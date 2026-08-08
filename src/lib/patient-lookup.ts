import { apiFetch, type ApiUser } from "@/lib/api-client";

export interface NewPatientPayload {
  name: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  blood_group?: string;
  marital_status?: string;
}

// Live lookup as the doctor types a phone number — no side effects, just
// tells the caller whether a patient already exists under that number.
export async function findPatientByPhone(token: string, phone: string): Promise<ApiUser | null> {
  try {
    const res = await apiFetch<{ data: ApiUser }>(`/users/phone/${encodeURIComponent(phone)}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

// Finds the patient by phone, or creates a new "USER" account with the
// given details if none exists yet — used once the doctor confirms.
export async function findOrCreatePatientByPhone(
  token: string,
  phone: string,
  payload: NewPatientPayload
): Promise<ApiUser> {
  const res = await apiFetch<{ data: ApiUser }>(`/users/phone/${encodeURIComponent(phone)}`, {
    method: "POST",
    token,
    body: { ...payload, phone, type: "USER" },
  });
  return res.data;
}

export type AppointmentType = "HOSPITAL" | "CHAMBER" | "ONLINE";

export interface AppointmentChamberSummary {
  id: number;
  user_id: number;
  name: string;
  address: string | null;
  city: string | null;
  area: string | null;
  consultation_fee: number | string | null;
  is_active: boolean;
}

// The docs say appointments.store takes `consultation_fee`, but the real
// `appointments` table has no such column (confirmed via a live 500:
// "SQLSTATE[42S22]: Column not found... Unknown column 'consultation_fee'").
// The actual column — on both the request and the response — is `fee`.
//
// Confirmed via a real response (docs didn't show these): the list/show
// endpoints come back with the full counterpart accounts nested directly as
// `user_patient` / `user_doctor` (not wrapped), plus flattened
// `hospital_name` / `chamber_name` convenience strings and the full
// `hospital` / `chamber` objects.
export interface AppointmentRecord {
  id: number;
  user_patient_id: number;
  user_doctor_id: number;
  hospital_id: number | null;
  chamber_id: number | null;
  doctor_schedule_id: number | null;
  fee: number | string | null;
  discount: number | string | null;
  appointment_type: AppointmentType;
  status: string | null;
  appointment_date: string;
  appointment_time: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  hospital_name?: string | null;
  chamber_name?: string | null;
  user_patient?: ApiUser | null;
  user_doctor?: ApiUser | null;
  hospital?: { id: number; name: string } | null;
  chamber?: AppointmentChamberSummary | null;
}

export interface CreateAppointmentPayload {
  // Optional: when a patient books their own appointment, the API infers
  // the patient from the Bearer token (same token-only pattern as the rest
  // of this API) — appointments.store's request schema has no patient id
  // field at all. Only pass this when a DOCTOR is booking on behalf of a
  // patient they looked up (their token is the doctor's, not the patient's).
  user_patient_id?: number;
  user_doctor_id: number;
  hospital_id?: number;
  chamber_id?: number;
  doctor_schedule_id?: number;
  fee?: number;
  discount?: number;
  appointment_type: AppointmentType;
  status?: string;
  appointment_date: string;
  appointment_time?: string;
}

export async function createAppointment(token: string, payload: CreateAppointmentPayload): Promise<AppointmentRecord> {
  const res = await apiFetch<{ data: AppointmentRecord }>("/appointments", { method: "POST", token, body: payload });
  return res.data;
}

// Token-scoped like everything else in this API — a patient token returns
// their own appointments, a doctor token returns appointments booked with
// them.
export async function fetchUpcomingAppointments(token: string): Promise<AppointmentRecord[]> {
  try {
    const res = await apiFetch<{ data: AppointmentRecord[] }>("/appointments/upcoming", { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAllAppointments(token: string): Promise<AppointmentRecord[]> {
  try {
    const res = await apiFetch<{ data: AppointmentRecord[] }>("/appointments", { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}
