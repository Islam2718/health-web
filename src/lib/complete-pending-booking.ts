import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { createAppointment } from "@/lib/patient-lookup";
import { clearPendingBooking, getPendingBooking } from "@/lib/pending-booking";

// Called right after a successful login/register — completes a booking the
// visitor started anonymously on a doctor's profile, now that we know who
// they are. Returns true if a pending booking existed (booked or the
// attempt failed with a toast either way) so the caller can redirect
// straight to the appointments tab instead of the default destination.
//
// No patient id is sent — appointments.store infers the booking patient
// from the Bearer token, same as the rest of this API.
export async function completePendingBooking(token: string): Promise<boolean> {
  const pending = getPendingBooking();
  if (!pending) return false;

  try {
    await createAppointment(token, {
      user_doctor_id: pending.doctorUserId,
      chamber_id: pending.chamberId,
      doctor_schedule_id: pending.doctorScheduleId,
      fee: pending.fee != null ? Number(pending.fee) : undefined,
      appointment_type: "CHAMBER",
      appointment_date: pending.appointmentDate,
      appointment_time: pending.appointmentTime,
      status: "PENDING",
    });
    toast.success(`Appointment requested with ${pending.doctorName}.`);
  } catch (err) {
    toast.error(
      err instanceof ApiError
        ? err.message
        : "Signed in, but couldn't complete the booking — please try again from the doctor's page."
    );
  } finally {
    clearPendingBooking();
  }
  return true;
}
