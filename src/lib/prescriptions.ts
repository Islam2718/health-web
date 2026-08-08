import { apiFetch } from "@/lib/api-client";
import type { AppointmentType } from "@/lib/patient-lookup";

export interface MedicineEntry {
  name: string;
  dose?: string;
  schedule?: string;
  duration?: string;
  notes?: string;
}

export interface CreatePrescriptionPayload {
  appointment_id: number;
  doctor_user_id: number;
  patient_user_id: number;
  schedule_id?: number;
  chamber_id?: number;
  appointment_type: AppointmentType;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse?: number;
  is_smoking?: boolean;
  sugar_level?: string;
  symptoms?: string;
  diagnosis?: string;
  medicines: MedicineEntry[];
  prescription_date?: string;
  notes?: string;
}

export interface AppointmentPrescriptionRecord {
  id: number;
  appointment_id: number;
  doctor_user_id: number;
  patient_user_id: number;
  schedule_id: number | null;
  chamber_id: number | null;
  appointment_type: AppointmentType;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse: number | null;
  is_smoking: boolean;
  sugar_level: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  medicines: MedicineEntry[] | null;
  prescription_date: string | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function createAppointmentPrescription(
  token: string,
  payload: CreatePrescriptionPayload
): Promise<AppointmentPrescriptionRecord> {
  const res = await apiFetch<{ data: AppointmentPrescriptionRecord }>("/appointment-prescriptions", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

// Token-scoped like everything else in this API — returns the prescriptions
// this doctor (or this patient) is party to.
export async function fetchAppointmentPrescriptions(token: string): Promise<AppointmentPrescriptionRecord[]> {
  try {
    const res = await apiFetch<{ data: AppointmentPrescriptionRecord[] }>("/appointment-prescriptions", { token });
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAppointmentPrescription(
  token: string,
  id: number
): Promise<AppointmentPrescriptionRecord | null> {
  try {
    const res = await apiFetch<{ data: AppointmentPrescriptionRecord }>(`/appointment-prescriptions/${id}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}
