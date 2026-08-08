// Captures the "book this slot" intent when an anonymous visitor picks a
// schedule on a doctor's public profile — held just long enough to survive
// the sign-in/register round trip, then consumed once to actually create
// the appointment under the now-known user id. sessionStorage (not
// localStorage) on purpose: this is a short-lived intent, not something
// that should linger across browser sessions.
const KEY = "ibnocare_pending_booking";

export interface PendingBooking {
  doctorId: number;
  doctorUserId: number;
  doctorName: string;
  chamberId: number;
  chamberName: string;
  doctorScheduleId: number;
  appointmentDate: string;
  appointmentTime: string;
  fee: number | string | null;
}

export function savePendingBooking(booking: PendingBooking) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(booking));
}

export function getPendingBooking(): PendingBooking | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingBooking;
  } catch {
    return null;
  }
}

export function clearPendingBooking() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
