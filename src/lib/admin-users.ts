import { apiFetch, type ApiUser } from "@/lib/api-client";

// Admin-side user management — GET/POST /users, GET/PUT/DELETE /users/{id}.
// All Bearer-authenticated with the signed-in admin's own token.

export interface AdminUserPayload {
  name: string;
  email?: string;
  phone?: string;
  // Required on create; on edit, send only if the admin actually wants to
  // change it — the update form leaves this blank by default so it isn't
  // forced to be re-entered on every edit.
  password?: string;
  type: string;
  gender?: string;
  date_of_birth?: string;
  profile_image?: string;
  address?: string;
  blood_group?: string;
  marital_status?: string;
}

interface UsersIndexResponse {
  data: ApiUser[];
  meta?: { current_page: number; last_page: number; total: number };
}

// No search/type query params are documented for the index, and no sample
// response was shared to confirm whether it paginates by default — this
// fetches whatever the endpoint returns as-is and filters client-side. If
// the backend does paginate, only the first page will show here (a known
// limitation, same tradeoff already accepted for other undocumented list
// endpoints in this app).
export async function fetchUsers(token: string): Promise<{ users: ApiUser[]; failed: boolean }> {
  try {
    const res = await apiFetch<UsersIndexResponse>("/users", { token });
    return { users: res?.data ?? [], failed: false };
  } catch {
    return { users: [], failed: true };
  }
}

export async function fetchUser(token: string, id: number | string): Promise<ApiUser | null> {
  try {
    const res = await apiFetch<{ data: ApiUser }>(`/users/${id}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function createUser(token: string, payload: AdminUserPayload): Promise<ApiUser> {
  const res = await apiFetch<{ message: string; data: ApiUser }>("/users", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function updateUser(
  token: string,
  id: number | string,
  payload: AdminUserPayload
): Promise<ApiUser> {
  const res = await apiFetch<{ message: string; data: ApiUser }>(`/users/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return res.data;
}

export async function deleteUser(token: string, id: number | string): Promise<void> {
  await apiFetch<{ message: string }>(`/users/${id}`, { method: "DELETE", token });
}

// The five roles this admin panel manages, mapped to the API's real `type`
// values — matches the taxonomy already used by the role filter chips.
export const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: "Patient", value: "USER" },
  { label: "Doctor", value: "DOCTOR" },
  { label: "Driver", value: "DRIVER" },
  { label: "Pharmacist", value: "PHARMACIST" },
  { label: "Admin", value: "ADMIN" },
];

export function roleLabel(type: string | null | undefined): string {
  if (!type) return "Patient";
  const first = type.split(",")[0]?.trim().toUpperCase();
  return ROLE_OPTIONS.find((r) => r.value === first)?.label ?? type;
}
