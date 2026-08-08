import type { ApiUser } from "@/lib/api-client";

export const AUTH_COOKIE = "ibnocare_access_token";
export const USER_COOKIE = "ibnocare_user";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AppUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  gender: string | null;
  dateOfBirth: string | null;
  profileImage: string | null;
  address: string | null;
  bloodGroup: string | null;
  maritalStatus: string | null;
  createdAt: string | null;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  profile_image?: string;
  address?: string;
  blood_group?: string;
  marital_status?: string;
}

export function toAppUser(raw: ApiUser): AppUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    type: raw.type,
    gender: raw.gender,
    dateOfBirth: raw.date_of_birth,
    profileImage: raw.profile_image,
    address: raw.address,
    bloodGroup: raw.blood_group,
    maritalStatus: raw.marital_status,
    createdAt: raw.created_at,
  };
}

const BASE_PROFILE_FIELDS = ["email", "gender", "dateOfBirth", "address", "bloodGroup", "maritalStatus"] as const;

export function isProfileComplete(user: AppUser | null): boolean {
  if (!user) return false;
  return BASE_PROFILE_FIELDS.every((field) => Boolean(user[field]));
}

export function baseProfileCompletionPercent(user: AppUser | null): number {
  if (!user) return 0;
  const filled = BASE_PROFILE_FIELDS.filter((field) => Boolean(user[field])).length;
  return Math.round((filled / BASE_PROFILE_FIELDS.length) * 100);
}
