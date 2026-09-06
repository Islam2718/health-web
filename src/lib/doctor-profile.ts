import { apiFetch } from "@/lib/api-client";

export interface DoctorRecord {
  id: number;
  title: string | null;
  specialization: string | null;
  license_number: string | null;
  bio: string | null;
}

export interface EducationRecord {
  id: number;
  institution: string | null;
  degree: string | null;
  field_of_study: string | null;
  grade: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface ExperienceRecord {
  id: number;
  job_title: string | null;
  company_name: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface ChamberRecord {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  consultation_fee: number | null;
  is_active: boolean;
}

export interface DoctorScheduleRecord {
  id: number;
  chamber_id: number;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: number | null;
  max_patients: number | null;
  consultation_fee: number | null;
  is_active: boolean;
}

function unwrapList<T>(res: { data?: T[] } | T[] | null | undefined): T[] {
  if (!res) return [];
  return Array.isArray(res) ? res : (res.data ?? []);
}

// These three all identify "me" purely from the Bearer token — no id or
// user_id is ever passed for the existence-check GETs.
export async function fetchMyDoctorProfile(token: string): Promise<DoctorRecord | null> {
  try {
    const res = await apiFetch<{ data: DoctorRecord }>("/doctors", { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchMyEducations(token: string): Promise<EducationRecord[]> {
  try {
    const res = await apiFetch<{ data: EducationRecord[] } | EducationRecord[]>("/educations", { token });
    return unwrapList(res);
  } catch {
    return [];
  }
}

export async function fetchMyExperiences(token: string): Promise<ExperienceRecord[]> {
  try {
    const res = await apiFetch<{ data: ExperienceRecord[] } | ExperienceRecord[]>("/professional-experiences", {
      token,
    });
    return unwrapList(res);
  } catch {
    return [];
  }
}

export async function fetchMyChambers(token: string): Promise<ChamberRecord[]> {
  try {
    const res = await apiFetch<{ data: ChamberRecord[] } | ChamberRecord[]>("/chambers", { token });
    return unwrapList(res);
  } catch {
    return [];
  }
}

export async function fetchMyDoctorSchedules(token: string): Promise<DoctorScheduleRecord[]> {
  try {
    const res = await apiFetch<{ data: DoctorScheduleRecord[] } | DoctorScheduleRecord[]>("/doctor-schedules", {
      token,
    });
    return unwrapList(res);
  } catch {
    return [];
  }
}

// The API represents multi-role accounts as a comma-separated type string,
// e.g. "USER, DOCTOR" — these helpers parse/build that.
export function getRoles(type: string | null | undefined): string[] {
  return (type ?? "")
    .split(",")
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);
}

export function hasRole(type: string | null | undefined, role: string): boolean {
  return getRoles(type).includes(role.toUpperCase());
}

export function withRole(type: string | null | undefined, role: string): string {
  const roles = getRoles(type);
  const upperRole = role.toUpperCase();
  if (!roles.includes(upperRole)) roles.push(upperRole);
  return roles.join(", ");
}

// A name shown anywhere a person could be either a patient or a doctor
// (community posts/comments, ratings, etc.) — prefixes "Dr." when their
// account type says DOCTOR, same as the dashboard profile header.
export function displayNameWithTitle(name: string, type: string | null | undefined): string {
  return hasRole(type, "DOCTOR") ? `Dr. ${name}` : name;
}
