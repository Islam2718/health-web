// Centralized API config — change NEXT_PUBLIC_API_BASE_URL in .env.local to
// point the whole app at a different backend without touching call sites.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://health-api.phicsart.com/api"
).replace(/\/$/, "");

export const APP_BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://health.phicsart.com"
).replace(/\/$/, "");

// Shared shape returned by POST /login for every account type (patient,
// doctor, driver, pharmacist, admin) — role-specific screens map this
// generic record into their own display type.
export interface ApiUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  gender: string | null;
  date_of_birth: string | null;
  profile_image: string | null;
  address: string | null;
  blood_group: string | null;
  marital_status: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LoginApiResponse {
  message: string;
  token: string;
  user: ApiUser;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

function extractMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0, null);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(extractMessage(data, `Request failed with status ${res.status}`), res.status, data);
  }

  return data as T;
}
