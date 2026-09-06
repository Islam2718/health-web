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

export type AppointmentType = "HOSPITAL" | "CHAMBER" | "ONLINE";

// The phone-lookup response now comes back with the patient's existing
// appointments (with this doctor) and prescriptions alongside their profile
// — but the nested appointment shape uses different field names than the
// main /appointments endpoints: `consultation_fee` instead of `fee`, and a
// flat `doctor` instead of `user_doctor` (there's no `user_patient` either,
// since the outer `data` object already *is* the patient).
export interface PatientLookupAppointment {
  id: number;
  user_patient_id: number;
  user_doctor_id: number;
  hospital_id: number | null;
  chamber_id: number | null;
  doctor_schedule_id: number | null;
  consultation_fee: number | string | null;
  discount: number | string | null;
  appointment_type: AppointmentType;
  status: string | null;
  appointment_date: string;
  appointment_time: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  hospital_name?: string | null;
  chamber_name?: string | null;
  doctor?: ApiUser | null;
  hospital?: { id: number; name: string } | null;
  chamber?: AppointmentChamberSummary | null;
}

export interface PatientLookupResult {
  patient: ApiUser;
  appointments: PatientLookupAppointment[];
  prescriptions: unknown[];
}

// Live lookup as the doctor types a phone number — no side effects, just
// tells the caller whether a patient already exists under that number (and,
// if so, what appointments/prescriptions they already have with this
// doctor).
export async function findPatientByPhone(token: string, phone: string): Promise<PatientLookupResult | null> {
  try {
    const res = await apiFetch<{ data: ApiUser; appointments?: PatientLookupAppointment[]; prescriptions?: unknown[] }>(
      `/users/phone/${encodeURIComponent(phone)}`,
      { token }
    );
    if (!res?.data) return null;
    return { patient: res.data, appointments: res.appointments ?? [], prescriptions: res.prescriptions ?? [] };
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
): Promise<PatientLookupResult> {
  const res = await apiFetch<{ data: ApiUser; appointments?: PatientLookupAppointment[]; prescriptions?: unknown[] }>(
    `/users/phone/${encodeURIComponent(phone)}`,
    {
      method: "POST",
      token,
      body: { ...payload, phone, type: "USER" },
    }
  );
  return { patient: res.data, appointments: res.appointments ?? [], prescriptions: res.prescriptions ?? [] };
}

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

// Normalizes a phone-lookup appointment (different field names — see
// PatientLookupAppointment) into the shape the rest of the app already
// works with, so a found appointment can be merged straight into the same
// upcoming/all appointment lists used everywhere else.
export function patientLookupAppointmentToRecord(
  apt: PatientLookupAppointment,
  patient: ApiUser
): AppointmentRecord {
  return {
    id: apt.id,
    user_patient_id: apt.user_patient_id,
    user_doctor_id: apt.user_doctor_id,
    hospital_id: apt.hospital_id,
    chamber_id: apt.chamber_id,
    doctor_schedule_id: apt.doctor_schedule_id,
    fee: apt.consultation_fee,
    discount: apt.discount,
    appointment_type: apt.appointment_type,
    status: apt.status,
    appointment_date: apt.appointment_date,
    appointment_time: apt.appointment_time,
    created_at: apt.created_at,
    updated_at: apt.updated_at,
    hospital_name: apt.hospital_name,
    chamber_name: apt.chamber_name,
    user_patient: patient,
    user_doctor: apt.doctor,
    hospital: apt.hospital,
    chamber: apt.chamber,
  };
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

// PUT /appointments/{id} — docs list the body field as `consultation_fee`,
// but that's the same doc/schema mismatch already confirmed on the store
// endpoint (the real column is `fee`); using the same field name here that
// we know actually works against the live table.
export interface UpdateAppointmentPayload {
  user_doctor_id: number;
  hospital_id?: number | null;
  chamber_id?: number | null;
  doctor_schedule_id?: number | null;
  fee?: number | null;
  discount?: number | null;
  appointment_type: AppointmentType;
  status?: string;
  appointment_date: string;
  appointment_time?: string;
}

export async function updateAppointment(
  token: string,
  id: number,
  payload: UpdateAppointmentPayload
): Promise<AppointmentRecord> {
  const res = await apiFetch<{ data: AppointmentRecord }>(`/appointments/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
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

// GET /my-appointments — dedicated endpoint scoped to "the authenticated
// user acting as patient" (matches on user_patient_id regardless of who the
// doctor is). Distinct from /appointments, which for a doctor token returns
// the doctor's own appointments (matches on user_doctor_id) — the two can
// genuinely differ for a dual-role account. Same AppointmentRecord shape.
export async function fetchMyAppointments(token: string): Promise<AppointmentRecord[]> {
  try {
    const res = await apiFetch<{ data: AppointmentRecord[] }>("/my-appointments", { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}
