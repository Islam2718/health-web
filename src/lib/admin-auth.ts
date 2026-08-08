import type { ApiUser } from "@/lib/api-client";

export const ADMIN_AUTH_COOKIE = "ibnocare_admin_token";
export const ADMIN_USER_COOKIE = "ibnocare_admin_user";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  profileImage: string | null;
}

export function toAdminUser(raw: ApiUser): AdminUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    type: raw.type,
    profileImage: raw.profile_image,
  };
}
