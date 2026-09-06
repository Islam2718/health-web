import { apiFetch, type ApiUser } from "@/lib/api-client";

// Quick "find or create a customer by phone" pair used by the POS checkout
// step — distinct from the full admin user CRUD in admin-users.ts. Confirmed
// via a real response sample: GET returns the same shape as a login/profile
// user record (plus appointments/prescriptions arrays we don't need here).

export async function findCustomerByPhone(token: string, phone: string): Promise<ApiUser | null> {
  try {
    const res = await apiFetch<{ data: ApiUser }>(`/users/phone/${encodeURIComponent(phone)}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  password?: string;
  type?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  blood_group?: string;
  marital_status?: string;
}

// No real response sample was shown for the create side, only the request
// body — handled defensively here in case it isn't wrapped in `data` like
// every other confirmed endpoint (the same unwrapped-response quirk already
// hit once before with posts.store).
export async function createCustomerByPhone(
  token: string,
  phone: string,
  payload: CreateCustomerPayload
): Promise<ApiUser> {
  const res = await apiFetch<{ data: ApiUser } | ApiUser>(`/users/phone/${encodeURIComponent(phone)}`, {
    method: "POST",
    token,
    body: payload,
  });
  return "data" in res ? res.data : res;
}
