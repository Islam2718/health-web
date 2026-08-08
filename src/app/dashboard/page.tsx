"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Activity,
  Ambulance,
  BadgeCheck,
  BarChart3,
  Building2,
  Cake,
  Camera,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Clock,
  Droplet,
  FilePlus,
  FileText,
  FlaskConical,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Pill,
  Plus,
  Printer,
  Search,
  Stethoscope,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DashboardActivityChart } from "@/components/dashboard/dashboard-activity-chart";
import { ScheduleCalendar, type DateRange } from "@/components/dashboard/schedule-calendar";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { AvatarPicker } from "@/components/dashboard/avatar-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { apiFetch, ApiError, type ApiUser } from "@/lib/api-client";
import {
  findPatientByPhone,
  findOrCreatePatientByPhone,
  createAppointment,
  fetchUpcomingAppointments,
  fetchAllAppointments,
  type AppointmentRecord,
  type AppointmentType,
} from "@/lib/patient-lookup";
import {
  createAppointmentPrescription,
  fetchAppointmentPrescriptions,
  type MedicineEntry,
  type AppointmentPrescriptionRecord,
} from "@/lib/prescriptions";
import type { PublicMedicineRecord } from "@/lib/medicines";
import { MedicineSearchInput } from "@/components/dashboard/medicine-search-input";
import { appointments, diagnosticReports, prescriptions } from "@/lib/dashboard-data";
import { bloodGroupOptions } from "@/lib/patients-data";
import { cn } from "@/lib/utils";
import {
  fetchMyChambers,
  fetchMyDoctorProfile,
  fetchMyDoctorSchedules,
  fetchMyEducations,
  fetchMyExperiences,
  getRoles,
  hasRole,
  type ChamberRecord,
  type DoctorRecord,
  type DoctorScheduleRecord,
} from "@/lib/doctor-profile";
import { expandScheduleDates, toApiTime, fromApiTime, type RecurrenceType } from "@/lib/schedule-recurrence";

// Allowed values per appointments.store's docs: PENDING, APPROVED, REJECTED,
// CANCELLED, COMPLETED, EXPIRED (or null).
const appointmentStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-primary/10 text-primary",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-secondary text-secondary-foreground",
};

type TabKey =
  | "profile"
  | "appointments"
  | "prescriptions"
  | "diagnostic-reports"
  | "chamber"
  | "schedule";

type NavItem = { key: TabKey; label: string; icon: typeof UserIcon };

const patientNavItems: NavItem[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "diagnostic-reports", label: "Diagnostic Reports", icon: FlaskConical },
];

const profileOnlyNavItems: NavItem[] = [{ key: "profile", label: "Profile", icon: UserIcon }];

// One combined menu for doctors — daily-use tabs first (Appointments,
// Prescriptions), setup tabs after (Schedule, Chamber), Profile/Diagnostic
// Reports bookending it. No separate "patient" group underneath — that
// duplicated Appointments/Prescriptions as two entries pointing at the same
// tab, which was confusing.
const doctorNavItems: NavItem[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "schedule", label: "Schedule", icon: CalendarClock },
  { key: "chamber", label: "Chamber", icon: Building2 },
  { key: "diagnostic-reports", label: "Diagnostic Reports", icon: FlaskConical },
];

const ALL_TAB_KEYS: TabKey[] = [
  "profile",
  "appointments",
  "prescriptions",
  "diagnostic-reports",
  "chamber",
  "schedule",
];

// Index matches JS Date#getDay() (0 = Sunday .. 6 = Saturday).
const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

function formatDateForDisplay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function calculateAge(dob: string): number | null {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

// Each account role gets its own banner treatment so the dashboard reads
// differently at a glance for a doctor vs. a patient vs. a driver, etc.
// A light pastel tint per role (not a bold color block) — content stays dark
// text throughout, the tint is just enough to read as "this role's color."
function getRoleBannerClass(roles: string[]): string {
  if (roles.includes("DOCTOR")) return "bg-linear-to-br from-amber-100 to-orange-100";
  if (roles.includes("DRIVER")) return "bg-linear-to-br from-sky-100 to-blue-100";
  if (roles.includes("PHARMACIST")) return "bg-linear-to-br from-violet-100 to-purple-100";
  if (roles.includes("ADMIN")) return "bg-linear-to-br from-slate-100 to-slate-200";
  return "bg-linear-to-br from-secondary to-secondary";
}

function ProfileCompletionRing({ percent, accent = "teal" }: { percent: number; accent?: "teal" | "amber" }) {
  const size = 40;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center" title={`Profile ${percent}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" className="stroke-secondary" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-[stroke-dashoffset] duration-500",
            accent === "amber" ? "stroke-amber-500" : "stroke-primary"
          )}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">{percent}%</span>
    </div>
  );
}

function DashboardPageInner() {
  const { user, token, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [appointmentsView, setAppointmentsView] = useState<"upcoming" | "all">("upcoming");
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentRecord[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentRecord[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  // Create Prescription and Diagnostic Service are UI placeholders (local
  // state only) — not backed by a real endpoint yet. Chamber and Weekly
  // Schedule are both wired to the real /chambers and /doctor-schedules API.
  const [chambers, setChambers] = useState<ChamberRecord[]>([]);
  const [chamberFormOpen, setChamberFormOpen] = useState<"new" | number | null>(null);
  const [chamberName, setChamberName] = useState("");
  const [chamberAddress, setChamberAddress] = useState("");
  const [chamberCity, setChamberCity] = useState("");
  const [chamberArea, setChamberArea] = useState("");
  const [chamberFee, setChamberFee] = useState("");
  const [chamberActive, setChamberActive] = useState(true);
  const [savingChamber, setSavingChamber] = useState(false);
  const [confirmDeleteChamberId, setConfirmDeleteChamberId] = useState<number | null>(null);
  const [deletingChamberId, setDeletingChamberId] = useState<number | null>(null);

  // Schedule tab: full calendar-based scheduling. `schedules` holds every
  // record fetched for this doctor; the tab filters to `scheduleChamberId`.
  const [schedules, setSchedules] = useState<DoctorScheduleRecord[]>([]);
  const [scheduleChamberId, setScheduleChamberId] = useState<number | null>(null);
  const [scheduleRange, setScheduleRange] = useState<DateRange>({ start: null, end: null });
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("day");
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState("1");
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [slotFee, setSlotFee] = useState("");
  const [slotDuration, setSlotDuration] = useState("");
  const [maxPatients, setMaxPatients] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<number | null>(null);

  // Find-or-create-patient + book-appointment flow, both live inside the
  // Appointments tab behind an "Add Appointment" toggle: search by phone
  // (live lookup on keystroke), fall back to creating a new patient
  // account, then book an appointment for whichever patient ends up
  // selected.
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  // True when the panel was opened from the Prescriptions tab's empty state
  // — on a successful booking we skip the "go find it in Appointments" step
  // and jump straight into the prescription form for the new appointment.
  const [bookingFromPrescriptionsTab, setBookingFromPrescriptionsTab] = useState(false);
  const [patientPhone, setPatientPhone] = useState("");
  const [patientSearching, setPatientSearching] = useState(false);
  const [patientSearched, setPatientSearched] = useState(false);
  const [foundPatient, setFoundPatient] = useState<ApiUser | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<ApiUser | null>(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("");
  const [newPatientDob, setNewPatientDob] = useState("");
  const [newPatientAddress, setNewPatientAddress] = useState("");
  const [newPatientBloodGroup, setNewPatientBloodGroup] = useState("");
  const [savingPatient, setSavingPatient] = useState(false);

  const [apptType, setApptType] = useState<AppointmentType>("CHAMBER");
  const [apptChamberId, setApptChamberId] = useState<number | null>(null);
  const [apptScheduleId, setApptScheduleId] = useState<number | null>(null);
  // Defaults to today — a doctor booking this way is almost always doing it
  // for a visit happening now/soon, not scheduling far ahead.
  const [apptDate, setApptDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [apptTime, setApptTime] = useState("");
  const [apptFee, setApptFee] = useState("");
  const [apptDiscount, setApptDiscount] = useState("");
  const [bookingAppointment, setBookingAppointment] = useState(false);

  // Create Prescription is gated behind a specific appointment — the doctor
  // must arrive via the "Create Prescription" button on an appointment row
  // (Appointments tab), which carries appointment_id/doctor_user_id/
  // patient_user_id along. No freestanding prescription form.
  const [rxAppointmentId, setRxAppointmentId] = useState<number | null>(null);
  const [rxBpSystolic, setRxBpSystolic] = useState("");
  const [rxBpDiastolic, setRxBpDiastolic] = useState("");
  const [rxPulse, setRxPulse] = useState("");
  const [rxIsSmoking, setRxIsSmoking] = useState(false);
  const [rxSugarLevel, setRxSugarLevel] = useState("");
  const [rxSymptoms, setRxSymptoms] = useState("");
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxMedicines, setRxMedicines] = useState<MedicineEntry[]>([
    { name: "", dose: "", schedule: "", duration: "", notes: "" },
  ]);
  const [rxDate, setRxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rxNotes, setRxNotes] = useState("");
  const [savingRx, setSavingRx] = useState(false);
  const [createdPrescription, setCreatedPrescription] = useState<AppointmentPrescriptionRecord | null>(null);
  const [issuedPrescriptionsCount, setIssuedPrescriptionsCount] = useState(0);

  // Prescription history — independent of the create-a-prescription gate,
  // so a doctor can browse and re-print anything they've already written.
  const [prescriptionHistory, setPrescriptionHistory] = useState<AppointmentPrescriptionRecord[]>([]);
  const [prescriptionHistoryLoading, setPrescriptionHistoryLoading] = useState(true);
  const [viewingPrescription, setViewingPrescription] = useState<AppointmentPrescriptionRecord | null>(null);

  const [doctorStatus, setDoctorStatus] = useState<{
    hasDoctorProfile: boolean;
    hasEducation: boolean;
    hasExperience: boolean;
    hasChamber: boolean;
    hasSchedule: boolean;
  } | null>(null);
  const [myDoctorRecord, setMyDoctorRecord] = useState<DoctorRecord | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
      setEmail(user.email ?? "");
      setGender(user.gender ?? "");
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "");
      setAddress(user.address ?? "");
      setBloodGroup(user.bloodGroup ?? "");
      setMaritalStatus(user.maritalStatus ?? "");
      setProfileImageUrl(user.profileImage ?? null);
    }
  }, [user]);

  const roles = getRoles(user?.type);
  // The API's default self-registration type is "USER" — treat that the
  // same as "PATIENT" for consumer-facing sections (appointments, etc.).
  const isPatient = roles.includes("PATIENT") || roles.includes("USER");
  const isDoctor = roles.includes("DOCTOR");
  const age = user?.dateOfBirth ? calculateAge(user.dateOfBirth) : null;

  useEffect(() => {
    if (!isDoctor || !token) return;
    let cancelled = false;
    (async () => {
      const [doctor, educations, experiences, chamberList, scheduleList] = await Promise.all([
        fetchMyDoctorProfile(token),
        fetchMyEducations(token),
        fetchMyExperiences(token),
        fetchMyChambers(token),
        fetchMyDoctorSchedules(token),
      ]);
      if (cancelled) return;

      setDoctorStatus({
        hasDoctorProfile: Boolean(
          doctor?.title && doctor?.specialization && doctor?.license_number && doctor?.bio
        ),
        hasEducation: educations.length > 0,
        hasExperience: experiences.length > 0,
        hasChamber: chamberList.length > 0,
        hasSchedule: scheduleList.length > 0,
      });
      setChambers(chamberList);
      setSchedules(scheduleList);
      setMyDoctorRecord(doctor);
    })();
    return () => {
      cancelled = true;
    };
  }, [isDoctor, token]);

  const scheduleChamber = chambers.find((c) => c.id === scheduleChamberId) ?? null;
  const chamberSchedules = schedules
    .filter((s) => s.chamber_id === scheduleChamberId)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time ?? "").localeCompare(b.start_time ?? ""));

  const rxAppointment =
    [...upcomingAppointments, ...allAppointments].find((a) => a.id === rxAppointmentId) ?? null;

  // Whichever prescription should currently be shown in the hidden print
  // area — either the one just created, or one picked from history.
  const printablePrescription = createdPrescription ?? viewingPrescription;

  // Prefill the suggested fee from the chamber's default whenever the
  // selected chamber changes, but leave it alone once the doctor edits it.
  useEffect(() => {
    if (scheduleChamber?.consultation_fee != null) {
      setSlotFee(String(scheduleChamber.consultation_fee));
    }
  }, [scheduleChamberId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRecurrenceWeekday = (day: number) => {
    setRecurrenceWeekdays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]));
  };

  const createSchedule = async () => {
    if (!token || !scheduleChamberId) return;

    if (!slotStartTime || !slotEndTime) {
      toast.error("Set a start and end time for the slot.");
      return;
    }
    if (slotEndTime <= slotStartTime) {
      toast.error("End time must be after start time.");
      return;
    }
    if (recurrenceType === "weekly" && recurrenceWeekdays.length === 0) {
      toast.error("Pick at least one weekday for a weekly schedule.");
      return;
    }

    // Weekly/monthly patterns describe an ongoing habit ("every Sun & Sat")
    // — forcing the doctor to also drag-select an exact calendar range
    // every time is an extra step their mental model doesn't include, and
    // without it nothing gets scheduled at all. Day mode is inherently
    // about specific dates, so that one still requires an explicit pick.
    // The weekly window shrinks as more weekdays are picked, so the total
    // entry count stays under the 60-per-submit cap below.
    let effectiveRange = scheduleRange;
    if (!effectiveRange.start || !effectiveRange.end) {
      let windowDays: number | null = null;
      if (recurrenceType === "weekly") {
        const perWeek = Math.max(recurrenceWeekdays.length, 1);
        windowDays = Math.min(180, Math.max(28, Math.floor(50 / perWeek) * 7));
      } else if (recurrenceType === "monthly") {
        windowDays = 180;
      }
      if (windowDays == null) {
        toast.error("Pick a date (or drag to select a date range) on the calendar first.");
        return;
      }
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + windowDays);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      effectiveRange = { start: fmt(start), end: fmt(end) };
      toast(`No date range selected — scheduling for the next ${Math.round(windowDays / 7)} weeks.`);
    }
    const { start: rangeStart, end: rangeEnd } = effectiveRange;
    if (!rangeStart || !rangeEnd) return;

    let dates = expandScheduleDates({
      type: recurrenceType,
      startDate: rangeStart,
      endDate: rangeEnd,
      weekdays: recurrenceWeekdays,
      dayOfMonth: recurrenceDayOfMonth ? Number(recurrenceDayOfMonth) : undefined,
    });

    // A narrow drag-selected range can easily miss the pattern entirely —
    // e.g. "monthly, day 1" with a 2-day range at the end of the month
    // never touches the 1st of any month. Rather than fail outright, push
    // the end date out far enough to catch the next occurrence(s) and
    // retry once before giving up for real.
    if (dates.length === 0 && recurrenceType !== "day") {
      const extendedEnd = new Date(`${rangeStart}T00:00:00`);
      extendedEnd.setDate(extendedEnd.getDate() + (recurrenceType === "monthly" ? 180 : 90));
      dates = expandScheduleDates({
        type: recurrenceType,
        startDate: rangeStart,
        endDate: extendedEnd.toISOString().slice(0, 10),
        weekdays: recurrenceWeekdays,
        dayOfMonth: recurrenceDayOfMonth ? Number(recurrenceDayOfMonth) : undefined,
      });
      if (dates.length > 0) {
        toast(`Your selected range didn't reach the pattern — extended forward to find the next occurrence(s).`);
      }
    }

    if (dates.length === 0) {
      toast.error("That combination doesn't produce any schedule dates — check the range and pattern.");
      return;
    }
    if (dates.length > 60) {
      toast.error(`That would create ${dates.length} schedule entries — narrow the date range (max 60 at a time).`);
      return;
    }

    setSavingSchedule(true);
    const created: DoctorScheduleRecord[] = [];
    let failedCount = 0;
    for (const date of dates) {
      try {
        const payload = {
          chamber_id: scheduleChamberId,
          date,
          start_time: toApiTime(slotStartTime),
          end_time: toApiTime(slotEndTime),
          slot_duration: slotDuration ? Number(slotDuration) : undefined,
          max_patients: maxPatients ? Number(maxPatients) : undefined,
          consultation_fee: slotFee ? Number(slotFee) : undefined,
          is_active: true,
        };
        const res = await apiFetch<{ data: DoctorScheduleRecord }>("/doctor-schedules", {
          method: "POST",
          token,
          body: payload,
        });
        created.push(res.data);
      } catch {
        failedCount++;
      }
    }
    setSavingSchedule(false);

    if (created.length > 0) {
      setSchedules((list) => [...list, ...created]);
      setDoctorStatus((s) => (s ? { ...s, hasSchedule: true } : s));
    }
    if (failedCount > 0) {
      toast.error(`Created ${created.length} of ${dates.length} slots — ${failedCount} failed (maybe already exist).`);
    } else {
      toast.success(`${created.length} schedule ${created.length === 1 ? "slot" : "slots"} created`);
      setScheduleRange({ start: null, end: null });
    }
  };

  const deleteSchedule = async (id: number) => {
    if (!token) return;
    setDeletingScheduleId(id);
    try {
      await apiFetch(`/doctor-schedules/${id}`, { method: "DELETE", token });
      setSchedules((list) => {
        const next = list.filter((s) => s.id !== id);
        setDoctorStatus((s) => (s ? { ...s, hasSchedule: next.length > 0 } : s));
        return next;
      });
      toast.success("Schedule slot removed");
    } catch {
      toast.error("Could not remove that slot.");
    } finally {
      setDeletingScheduleId(null);
    }
  };

  // Live phone lookup as the doctor types — debounced, read-only (no
  // account gets created just by searching).
  useEffect(() => {
    if (!token) return;
    const phone = patientPhone.trim();
    if (selectedPatient || phone.length < 10) {
      setFoundPatient(null);
      setPatientSearched(false);
      return;
    }
    setPatientSearching(true);
    const handle = setTimeout(async () => {
      const patient = await findPatientByPhone(token, phone);
      setFoundPatient(patient);
      setPatientSearched(true);
      setPatientSearching(false);
      if (patient) setSelectedPatient(patient);
    }, 450);
    return () => clearTimeout(handle);
  }, [patientPhone, token, selectedPatient]);

  const resetPatientSearch = () => {
    setPatientPhone("");
    setFoundPatient(null);
    setPatientSearched(false);
    setSelectedPatient(null);
    setNewPatientName("");
    setNewPatientEmail("");
    setNewPatientGender("");
    setNewPatientDob("");
    setNewPatientAddress("");
    setNewPatientBloodGroup("");
    setApptChamberId(null);
    setApptScheduleId(null);
    setApptDate(new Date().toISOString().slice(0, 10));
    setApptTime("");
    setApptFee("");
    setApptDiscount("");
  };

  const createPatient = async () => {
    if (!token) return;
    if (!patientPhone.trim() || !newPatientName.trim()) {
      toast.error("Phone number and name are required.");
      return;
    }
    setSavingPatient(true);
    try {
      const patient = await findOrCreatePatientByPhone(token, patientPhone.trim(), {
        name: newPatientName,
        email: newPatientEmail || undefined,
        gender: newPatientGender || undefined,
        date_of_birth: newPatientDob || undefined,
        address: newPatientAddress || undefined,
        blood_group: newPatientBloodGroup || undefined,
      });
      setFoundPatient(patient);
      setSelectedPatient(patient);
      toast.success("Patient added");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not add patient."));
    } finally {
      setSavingPatient(false);
    }
  };

  const bookAppointment = async () => {
    if (!token || !user || !selectedPatient) return;
    if (!apptDate) {
      toast.error("Pick an appointment date.");
      return;
    }
    if (apptType === "CHAMBER" && !apptChamberId) {
      toast.error("Pick a chamber for this appointment.");
      return;
    }
    setBookingAppointment(true);
    try {
      const appt = await createAppointment(token, {
        user_patient_id: selectedPatient.id,
        user_doctor_id: user.id,
        appointment_type: apptType,
        appointment_date: apptDate,
        appointment_time: apptTime ? toApiTime(apptTime) : undefined,
        fee: apptFee ? Number(apptFee) : undefined,
        discount: apptDiscount ? Number(apptDiscount) : undefined,
        // A doctor booking directly is confirming the visit themselves —
        // no separate approval step needed.
        status: "APPROVED",
        chamber_id: apptType === "CHAMBER" && apptChamberId ? apptChamberId : undefined,
        doctor_schedule_id: apptType === "CHAMBER" && apptScheduleId ? apptScheduleId : undefined,
      });
      // Optimistic insert so `rxAppointment` can resolve immediately if we're
      // about to jump straight into the prescription form for it, without
      // waiting on the background refetch below.
      setUpcomingAppointments((list) => [appt, ...list]);
      setAllAppointments((list) => [appt, ...list]);
      toast.success("Appointment booked");
      setApptDate(new Date().toISOString().slice(0, 10));
      setApptTime("");
      setApptFee("");
      setApptDiscount("");
      setApptChamberId(null);
      setApptScheduleId(null);
      setAddAppointmentOpen(false);
      resetPatientSearch();
      refreshAppointments();
      if (bookingFromPrescriptionsTab) {
        setBookingFromPrescriptionsTab(false);
        goToAppointmentPrescription(appt.id);
      }
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not book the appointment."));
    } finally {
      setBookingAppointment(false);
    }
  };

  const openNewChamberForm = () => {
    setChamberName("");
    setChamberAddress("");
    setChamberCity("");
    setChamberArea("");
    setChamberFee("");
    setChamberActive(true);
    setChamberFormOpen("new");
  };

  const openEditChamberForm = (c: ChamberRecord) => {
    setChamberName(c.name ?? "");
    setChamberAddress(c.address ?? "");
    setChamberCity(c.city ?? "");
    setChamberArea(c.area ?? "");
    setChamberFee(c.consultation_fee != null ? String(c.consultation_fee) : "");
    setChamberActive(c.is_active ?? true);
    setChamberFormOpen(c.id);
  };

  const extractApiErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) {
      const body = err.body as { errors?: Record<string, string[]> } | null;
      return body?.errors ? (Object.values(body.errors)[0]?.[0] ?? err.message) : err.message;
    }
    return fallback;
  };

  const saveChamber = async () => {
    if (!token) return;
    if (!chamberName.trim()) {
      toast.error("Chamber name is required.");
      return;
    }
    const isEditing = typeof chamberFormOpen === "number";
    setSavingChamber(true);
    try {
      const payload = {
        name: chamberName,
        address: chamberAddress || undefined,
        city: chamberCity || undefined,
        area: chamberArea || undefined,
        consultation_fee: chamberFee ? Number(chamberFee) : undefined,
        is_active: chamberActive,
      };
      const res = isEditing
        ? await apiFetch<{ data: ChamberRecord }>(`/chambers/${chamberFormOpen}`, {
            method: "PUT",
            token,
            body: payload,
          })
        : await apiFetch<{ data: ChamberRecord }>("/chambers", { method: "POST", token, body: payload });
      setChambers((list) => (isEditing ? list.map((c) => (c.id === res.data.id ? res.data : c)) : [...list, res.data]));
      setDoctorStatus((s) => (s ? { ...s, hasChamber: true } : s));
      toast.success(isEditing ? "Chamber updated" : "Chamber added");
      setChamberFormOpen(null);
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save chamber details."));
    } finally {
      setSavingChamber(false);
    }
  };

  const deleteChamber = async (id: number) => {
    if (!token) return;
    setDeletingChamberId(id);
    try {
      await apiFetch(`/chambers/${id}`, { method: "DELETE", token });
      setChambers((list) => {
        const next = list.filter((c) => c.id !== id);
        setDoctorStatus((s) => (s ? { ...s, hasChamber: next.length > 0 } : s));
        return next;
      });
      // Clean up any schedule slots pointing at the now-deleted chamber.
      const orphaned = schedules.filter((s) => s.chamber_id === id);
      for (const s of orphaned) {
        try {
          await apiFetch(`/doctor-schedules/${s.id}`, { method: "DELETE", token });
        } catch {
          // Best effort — the chamber is gone either way.
        }
      }
      if (orphaned.length > 0) {
        setSchedules((list) => list.filter((s) => s.chamber_id !== id));
      }
      setScheduleChamberId((current) => (current === id ? null : current));

      toast.success("Chamber removed");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not remove chamber."));
    } finally {
      setDeletingChamberId(null);
      setConfirmDeleteChamberId(null);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    const allowedDoctorTabs = ["chamber", "schedule"];
    const allowed = tab === "profile" || isPatient || (isDoctor && allowedDoctorTabs.includes(tab ?? ""));
    if (tab && allowed && (ALL_TAB_KEYS as string[]).includes(tab)) {
      setActiveTab(tab as TabKey);
    }
  }, [searchParams, isPatient, isDoctor]);

  useEffect(() => {
    const chamberParam = searchParams.get("chamber");
    if (chamberParam) setScheduleChamberId(Number(chamberParam));
  }, [searchParams]);

  useEffect(() => {
    const appointmentParam = searchParams.get("appointment");
    if (appointmentParam) setRxAppointmentId(Number(appointmentParam));
  }, [searchParams]);

  // Keep the URL in sync with the active tab so a reload (or a shared link)
  // lands back on the same tab instead of always resetting to Profile.
  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    if (key === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", key);
    }
    if (key !== "schedule") params.delete("chamber");
    if (key !== "prescriptions") params.delete("appointment");
    const query = params.toString();
    router.replace(query ? `/dashboard?${query}` : "/dashboard", { scroll: false });
  };

  // Jumps straight to the Schedule tab pre-loaded with a specific chamber —
  // used by the "Make Schedule" button on each chamber card.
  const goToChamberSchedule = (chamberId: number) => {
    setScheduleChamberId(chamberId);
    setScheduleRange({ start: null, end: null });
    setActiveTab("schedule");
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "schedule");
    params.set("chamber", String(chamberId));
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  };

  // Jumps straight to the Prescriptions tab pre-loaded with a specific
  // appointment — used by the "Create Prescription" button on each
  // appointment row. Without an appointment selected, the prescription
  // form stays gated (no appointment_id/doctor_user_id/patient_user_id to
  // submit with).
  const goToAppointmentPrescription = (appointmentId: number) => {
    setRxAppointmentId(appointmentId);
    setCreatedPrescription(null);
    setActiveTab("prescriptions");
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "prescriptions");
    params.set("appointment", String(appointmentId));
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  };

  const handleSaveProfile = async () => {
    setSaveError(null);
    setIsSaving(true);
    const result = await updateProfile({
      name: name || undefined,
      phone: phone || undefined,
      email: email || undefined,
      gender: gender || undefined,
      date_of_birth: dateOfBirth || undefined,
      profile_image: profileImageUrl || undefined,
      address: address || undefined,
      blood_group: bloodGroup || undefined,
      marital_status: maritalStatus || undefined,
    });
    setIsSaving(false);
    if (!result.success) {
      setSaveError(result.message ?? "Failed to update profile.");
      return;
    }
    toast.success(result.message ?? "Profile updated successfully");
    setEditOpen(false);
  };

  const completionFields = [
    user?.email,
    user?.gender,
    user?.dateOfBirth,
    user?.address,
    user?.bloodGroup,
    user?.maritalStatus,
    ...(isDoctor
      ? [
          doctorStatus?.hasDoctorProfile,
          doctorStatus?.hasEducation,
          doctorStatus?.hasExperience,
          doctorStatus?.hasChamber,
          doctorStatus?.hasSchedule,
        ]
      : []),
  ];
  const filledFieldCount = completionFields.filter(Boolean).length;
  const profileCompletionPercent = Math.round((filledFieldCount / completionFields.length) * 100);
  const isProfileComplete = profileCompletionPercent === 100;

  const refreshAppointments = async () => {
    if (!token) return;
    setAppointmentsLoading(true);
    const [upcoming, all] = await Promise.all([fetchUpcomingAppointments(token), fetchAllAppointments(token)]);
    setUpcomingAppointments(upcoming);
    setAllAppointments(all);
    setAppointmentsLoading(false);
  };

  const refreshPrescriptionHistory = async () => {
    if (!token) return;
    setPrescriptionHistoryLoading(true);
    const history = await fetchAppointmentPrescriptions(token);
    setPrescriptionHistory(history.sort((a, b) => (b.prescription_date ?? "").localeCompare(a.prescription_date ?? "")));
    setPrescriptionHistoryLoading(false);
  };

  useEffect(() => {
    if (!isDoctor || !token) return;
    refreshPrescriptionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDoctor, token]);

  // A prescription re-printed from history has no directly-attached patient
  // name — fall back to the matching appointment's nested patient, if any.
  const patientLabelForPrescription = (rx: AppointmentPrescriptionRecord) => {
    const apt = [...upcomingAppointments, ...allAppointments].find((a) => a.id === rx.appointment_id);
    return apt?.user_patient?.name?.trim() || `Patient #${rx.patient_user_id}`;
  };

  // Printing from history: set the record, then print once the printable
  // DOM has actually updated for it.
  useEffect(() => {
    if (viewingPrescription) {
      window.print();
    }
  }, [viewingPrescription]);

  const resetPrescriptionForm = () => {
    setRxBpSystolic("");
    setRxBpDiastolic("");
    setRxPulse("");
    setRxIsSmoking(false);
    setRxSugarLevel("");
    setRxSymptoms("");
    setRxDiagnosis("");
    setRxMedicines([{ name: "", dose: "", schedule: "", duration: "", notes: "" }]);
    setRxDate(new Date().toISOString().slice(0, 10));
    setRxNotes("");
  };

  const updateMedicineRow = (index: number, field: keyof MedicineEntry, value: string) => {
    setRxMedicines((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addMedicineRow = () => {
    setRxMedicines((rows) => [...rows, { name: "", dose: "", schedule: "", duration: "", notes: "" }]);
  };

  const removeMedicineRow = (index: number) => {
    setRxMedicines((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  };

  // Picking a result from the medicine search fills the name and, if the
  // doctor hasn't already typed one, suggests a dose from the medicine's
  // packaged weight (e.g. "500mg") — never overwrites an existing edit.
  const selectMedicineForRow = (index: number, medicine: PublicMedicineRecord) => {
    setRxMedicines((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, name: medicine.name, dose: row.dose || medicine.weight || "" } : row
      )
    );
  };

  const createPrescription = async () => {
    if (!token || !rxAppointment) return;
    const medicines = rxMedicines
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        dose: m.dose?.trim() || undefined,
        schedule: m.schedule?.trim() || undefined,
        duration: m.duration?.trim() || undefined,
        notes: m.notes?.trim() || undefined,
      }));
    if (medicines.length === 0) {
      toast.error("Add at least one medicine.");
      return;
    }

    setSavingRx(true);
    try {
      const prescription = await createAppointmentPrescription(token, {
        appointment_id: rxAppointment.id,
        doctor_user_id: rxAppointment.user_doctor_id,
        patient_user_id: rxAppointment.user_patient_id,
        schedule_id: rxAppointment.doctor_schedule_id ?? undefined,
        chamber_id: rxAppointment.chamber_id ?? undefined,
        appointment_type: rxAppointment.appointment_type,
        blood_pressure_systolic: rxBpSystolic ? Number(rxBpSystolic) : undefined,
        blood_pressure_diastolic: rxBpDiastolic ? Number(rxBpDiastolic) : undefined,
        pulse: rxPulse ? Number(rxPulse) : undefined,
        is_smoking: rxIsSmoking,
        sugar_level: rxSugarLevel || undefined,
        symptoms: rxSymptoms || undefined,
        diagnosis: rxDiagnosis || undefined,
        medicines,
        prescription_date: rxDate || undefined,
        notes: rxNotes || undefined,
      });
      setCreatedPrescription(prescription);
      setIssuedPrescriptionsCount((n) => n + 1);
      refreshPrescriptionHistory();
      toast.success("Prescription created");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not create the prescription."));
    } finally {
      setSavingRx(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setAppointmentsLoading(true);
      const [upcoming, all] = await Promise.all([fetchUpcomingAppointments(token), fetchAllAppointments(token)]);
      if (cancelled) return;
      setUpcomingAppointments(upcoming);
      setAllAppointments(all);
      setAppointmentsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  // Shared "Find or Add Patient" + "Book Appointment" flow — rendered from
  // both the Appointments tab (normal booking) and the Prescriptions tab's
  // empty-state (quick "find patient, book, go straight to the prescription
  // form" path), toggled by the same `addAppointmentOpen` state either way.
  const addAppointmentPanel = (
    <>
      <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <Search className="size-4 text-amber-600 dark:text-amber-400" />
              Find or Add Patient
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Search by phone number — if they&apos;re not registered yet, add their details below.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAddAppointmentOpen(false);
              setBookingFromPrescriptionsTab(false);
              resetPatientSearch();
            }}
          >
            Cancel
          </Button>
        </div>

        {!selectedPatient ? (
          <>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="patientPhone">Phone Number</Label>
              <Input
                id="patientPhone"
                placeholder="e.g. 01712345678"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
              {patientSearching && <p className="text-xs text-muted-foreground">Searching…</p>}
              {!patientSearching && patientSearched && !foundPatient && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  No patient found with this number — add their details below.
                </p>
              )}
            </div>

            {!patientSearching && patientSearched && !foundPatient && (
              <div className="mt-4 space-y-4 rounded-xl border border-dashed border-border/60 p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPatientName">Full Name</Label>
                  <Input id="newPatientName" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPatientEmail">Email</Label>
                    <Input
                      id="newPatientEmail"
                      type="email"
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select value={newPatientGender} onValueChange={(v) => setNewPatientGender(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPatientDob">Date of Birth</Label>
                    <Input
                      id="newPatientDob"
                      type="date"
                      value={newPatientDob}
                      onChange={(e) => setNewPatientDob(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Blood Group</Label>
                    <Select value={newPatientBloodGroup} onValueChange={(v) => setNewPatientBloodGroup(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroupOptions.map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPatientAddress">Address</Label>
                  <Input
                    id="newPatientAddress"
                    value={newPatientAddress}
                    onChange={(e) => setNewPatientAddress(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 sm:w-auto"
                  onClick={createPatient}
                  disabled={savingPatient}
                >
                  <UserPlus />
                  {savingPatient ? "Adding..." : "Add Patient"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{selectedPatient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[selectedPatient.phone, selectedPatient.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetPatientSearch}>
                Change Patient
              </Button>
            </div>

            {(selectedPatient.blood_group ||
              selectedPatient.date_of_birth ||
              selectedPatient.marital_status ||
              selectedPatient.address) && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-xs sm:grid-cols-4">
                {selectedPatient.blood_group && (
                  <div>
                    <p className="text-muted-foreground">Blood Group</p>
                    <p className="font-medium text-foreground">{selectedPatient.blood_group}</p>
                  </div>
                )}
                {selectedPatient.date_of_birth && calculateAge(selectedPatient.date_of_birth) != null && (
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium text-foreground">{calculateAge(selectedPatient.date_of_birth)} yrs</p>
                  </div>
                )}
                {selectedPatient.marital_status && (
                  <div>
                    <p className="text-muted-foreground">Marital Status</p>
                    <p className="font-medium text-foreground capitalize">
                      {selectedPatient.marital_status.toLowerCase()}
                    </p>
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="col-span-2 sm:col-span-4">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{selectedPatient.address}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {selectedPatient && (
        <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <CalendarPlus className="size-4 text-amber-600 dark:text-amber-400" />
            Book Appointment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">For {selectedPatient.name}.</p>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={apptType}
                onValueChange={(v) => {
                  setApptType(v as AppointmentType);
                  setApptChamberId(null);
                  setApptScheduleId(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => (v === "CHAMBER" ? "Chamber Visit" : "Online Consultation")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHAMBER">Chamber Visit</SelectItem>
                  <SelectItem value="ONLINE">Online Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {apptType === "CHAMBER" && (
              <>
                <div className="space-y-1.5">
                  <Label>Chamber</Label>
                  <Select
                    value={apptChamberId != null ? String(apptChamberId) : ""}
                    onValueChange={(v) => {
                      const id = v ? Number(v) : null;
                      setApptChamberId(id);
                      setApptScheduleId(null);
                      const chamber = chambers.find((c) => c.id === id);
                      if (chamber?.consultation_fee != null) setApptFee(String(chamber.consultation_fee));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a chamber">
                        {(v: string) => chambers.find((c) => String(c.id) === v)?.name ?? v}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {chambers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {apptChamberId != null && (
                  <div className="space-y-1.5">
                    <Label>Available Slot</Label>
                    <Select
                      value={apptScheduleId != null ? String(apptScheduleId) : "manual"}
                      onValueChange={(v) => {
                        if (v === "manual") {
                          setApptScheduleId(null);
                          return;
                        }
                        const schedule = schedules.find((s) => s.id === Number(v));
                        if (!schedule) return;
                        setApptScheduleId(schedule.id);
                        setApptDate(schedule.date.slice(0, 10));
                        setApptTime(fromApiTime(schedule.start_time));
                        if (schedule.consultation_fee != null) setApptFee(String(schedule.consultation_fee));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(v: string) => {
                            if (v === "manual") return "Pick date/time manually";
                            const s = schedules.find((sc) => String(sc.id) === v);
                            return s
                              ? `${formatDateForDisplay(s.date.slice(0, 10))} · ${fromApiTime(s.start_time)}–${fromApiTime(s.end_time)}`
                              : v;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Pick date/time manually</SelectItem>
                        {schedules
                          .filter(
                            (s) =>
                              s.chamber_id === apptChamberId &&
                              s.date.slice(0, 10) >= new Date().toISOString().slice(0, 10)
                          )
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {formatDateForDisplay(s.date.slice(0, 10))} · {fromApiTime(s.start_time)}–
                              {fromApiTime(s.end_time)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="apptDate">Date</Label>
                <Input id="apptDate" type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apptTime">Time</Label>
                <Input id="apptTime" type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="apptFee">Consultation Fee (৳)</Label>
                <Input id="apptFee" type="number" value={apptFee} onChange={(e) => setApptFee(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apptDiscount">Discount (৳)</Label>
                <Input
                  id="apptDiscount"
                  type="number"
                  value={apptDiscount}
                  onChange={(e) => setApptDiscount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            className="mt-6 w-full border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 sm:w-auto"
            onClick={bookAppointment}
            disabled={bookingAppointment}
          >
            <CalendarPlus />
            {bookingAppointment ? "Booking..." : "Book Appointment"}
          </Button>
        </Card>
      )}
    </>
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Role-colored user summary banner — always visible */}
        <section className={cn("px-4 py-6 text-foreground sm:px-6 lg:px-8", getRoleBannerClass(roles))}>
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={name}
                  imageUrl={user.profileImage}
                  gender={user.gender}
                  className="size-16 rounded-2xl ring-2 ring-white ring-offset-0"
                  imageClassName="rounded-2xl"
                  fallbackClassName="bg-white text-xl font-semibold text-foreground"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h1 className="text-xl font-bold text-foreground">{name}</h1>
                    <BadgeCheck className="size-4.5 text-primary" />
                    {isDoctor && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm">
                        <Stethoscope className="size-3" />
                        Doctor
                      </span>
                    )}
                  </div>
                  {phone && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5" />
                      {phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
                {isDoctor && !isProfileComplete && (
                  <ProfileCompletionRing percent={profileCompletionPercent} accent="amber" />
                )}
                {isDoctor && (
                  <Link
                    href="/dashboard/become-a-doctor"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <Stethoscope />
                    {isProfileComplete ? "Doctor Profile" : "Update Doctor Profile"}
                  </Link>
                )}
                {!isDoctor && !isProfileComplete && <ProfileCompletionRing percent={profileCompletionPercent} />}
                <Dialog
                  open={editOpen}
                  onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) setSaveError(null);
                  }}
                >
                  <DialogTrigger render={<Button variant="outline" />}>
                    <Pencil />
                    {isDoctor || isProfileComplete ? "Edit Profile" : "Update Profile"}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>Update your personal details.</DialogDescription>
                    </DialogHeader>
                    <div className="-mx-1.5 max-h-[60vh] space-y-4 overflow-y-auto px-1.5 py-1">
                      <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAvatarPickerOpen((o) => !o)}
                            className="group relative rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            aria-label="Change profile picture"
                            aria-expanded={avatarPickerOpen}
                          >
                            <UserAvatar
                              name={name || "U"}
                              imageUrl={profileImageUrl}
                              gender={gender}
                              className="size-14 transition-opacity group-hover:opacity-80"
                            />
                            <span className="absolute right-0 bottom-0 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                              <Camera className="size-3" />
                            </span>
                          </button>
                          <p className="text-xs text-muted-foreground">
                            Click your picture to choose an avatar — a real photo upload isn&apos;t supported yet.
                          </p>
                        </div>
                        {avatarPickerOpen && (
                          <AvatarPicker
                            value={profileImageUrl}
                            onChange={(url) => {
                              setProfileImageUrl(url);
                              setAvatarPickerOpen(false);
                            }}
                          />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Gender</Label>
                          <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Blood Group</Label>
                          <Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v ?? "")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {bloodGroupOptions.map((bg) => (
                                <SelectItem key={bg} value={bg}>
                                  {bg}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Marital Status</Label>
                          <Select value={maritalStatus} onValueChange={(v) => setMaritalStatus(v ?? "")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Single">Single</SelectItem>
                              <SelectItem value="Married">Married</SelectItem>
                              <SelectItem value="Divorced">Divorced</SelectItem>
                              <SelectItem value="Widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      {saveError && <p className="text-xs text-destructive">{saveError}</p>}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {user.bloodGroup && (
                <div className="rounded-xl bg-white/70 p-3 text-center">
                  <Droplet className="mx-auto size-4.5 text-primary" />
                  <p className="mt-1.5 text-sm font-bold text-foreground">{user.bloodGroup}</p>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                </div>
              )}
              {user.gender && (
                <div className="rounded-xl bg-white/70 p-3 text-center">
                  <UserIcon className="mx-auto size-4.5 text-primary" />
                  <p className="mt-1.5 text-sm font-bold text-foreground capitalize">{user.gender.toLowerCase()}</p>
                  <p className="text-xs text-muted-foreground">Gender</p>
                </div>
              )}
              {user.maritalStatus && (
                <div className="rounded-xl bg-white/70 p-3 text-center">
                  <Users className="mx-auto size-4.5 text-primary" />
                  <p className="mt-1.5 text-sm font-bold text-foreground capitalize">
                    {user.maritalStatus.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">Marital Status</p>
                </div>
              )}
              {age != null && user.dateOfBirth && (
                <div className="rounded-xl bg-white/70 p-3 text-center">
                  <Cake className="mx-auto size-4.5 text-primary" />
                  <p className="mt-1.5 text-sm font-bold text-foreground">{age} yrs</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.dateOfBirth).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {user.createdAt && (
                <div className="rounded-xl bg-white/70 p-3 text-center">
                  <CalendarDays className="mx-auto size-4.5 text-primary" />
                  <p className="mt-1.5 text-sm font-bold text-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                  </p>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                </div>
              )}
              {user.address && (
                <div className="rounded-xl bg-white/70 p-3 text-center">
                  <MapPin className="mx-auto size-4.5 text-primary" />
                  <p className="mt-1.5 line-clamp-1 text-sm font-bold text-foreground">{user.address}</p>
                  <p className="text-xs text-muted-foreground">Address</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Compact quick-links row */}
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3">
            {!isDoctor && (
              <Link href="/dashboard/become-a-doctor" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Stethoscope />
                Become a Doctor
              </Link>
            )}
            <Link href="/register" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Ambulance />
              Register an Ambulance
            </Link>
            <Link href="/blood-donors" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Droplet />
              Become a Blood Donor
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Main content — switches per selected tab */}
            <div className="min-w-0 lg:order-2">
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <BarChart3 className="size-4 text-primary" />
                        Overview
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">A quick snapshot of your account activity.</p>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {(isDoctor
                          ? [
                              { icon: Users, value: 128, label: "Total Patients" },
                              { icon: CalendarDays, value: 24, label: "Appointments This Week" },
                              { icon: Building2, value: chambers.length, label: "Chambers" },
                              { icon: FilePlus, value: issuedPrescriptionsCount, label: "Prescriptions Issued" },
                            ]
                          : [
                              { icon: CalendarDays, value: appointments.length, label: "Appointments" },
                              { icon: FileText, value: prescriptions.length, label: "Prescriptions" },
                              { icon: FlaskConical, value: diagnosticReports.length, label: "Diagnostic Reports" },
                              {
                                icon: CalendarDays,
                                value: appointments.filter((a) => a.status === "Upcoming").length,
                                label: "Upcoming Visits",
                              },
                            ]
                        ).map((stat) => (
                          <div key={stat.label} className="rounded-xl bg-secondary/60 p-4 text-center">
                            <stat.icon className="mx-auto size-5 text-primary" />
                            <p className="mt-2 text-xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-foreground">
                          {isDoctor ? "Patients Seen" : "Appointments"} — Last 6 Months
                        </h4>
                        <div className="mt-2">
                          <DashboardActivityChart variant={isDoctor ? "doctor" : "patient"} />
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground">
                        Sample overview data — will reflect real activity once connected.
                      </p>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "appointments" && isPatient && (
                  <motion.div
                    key="appointments"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {isDoctor && addAppointmentOpen && addAppointmentPanel}

                    <Card className="border-border/60 p-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="flex items-center gap-2 font-semibold text-foreground">
                          <CalendarDays className="size-4 text-primary" />
                          Appointments
                        </h3>
                        {isDoctor && !addAppointmentOpen && (
                          <Button size="sm" variant="outline" onClick={() => setAddAppointmentOpen(true)}>
                            <CalendarPlus />
                            Add Appointment
                          </Button>
                        )}
                        {!isDoctor && (
                          <Button size="sm" render={<Link href="/doctors" />} nativeButton={false}>
                            <CalendarPlus />
                            Book a New Appointment
                          </Button>
                        )}
                      </div>

                      <Tabs
                        value={appointmentsView}
                        onValueChange={(v) => setAppointmentsView(v as "upcoming" | "all")}
                        className="mt-4"
                      >
                        <TabsList>
                          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                          <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="mt-4 space-y-3">
                        {appointmentsLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : (
                          (appointmentsView === "upcoming" ? upcomingAppointments : allAppointments).map((apt) => {
                            const counterpart = isDoctor ? apt.user_patient : apt.user_doctor;
                            const counterpartName =
                              counterpart?.name?.trim() ||
                              (isDoctor ? `Patient #${apt.user_patient_id}` : `Doctor #${apt.user_doctor_id}`);
                            const location = apt.chamber_name || apt.chamber?.name || apt.hospital_name || apt.hospital?.name;
                            const status = apt.status?.toUpperCase() ?? "";
                            return (
                              <div key={apt.id} className="rounded-xl border border-border/60 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex items-start gap-3">
                                    <UserAvatar
                                      name={counterpartName}
                                      imageUrl={counterpart?.profile_image}
                                      gender={counterpart?.gender}
                                      className="size-10 shrink-0"
                                    />
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {!isDoctor && "Dr. "}
                                        {counterpartName}
                                      </p>
                                      {(counterpart?.phone || (isDoctor && counterpart?.blood_group)) && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                          {counterpart?.phone}
                                          {isDoctor && counterpart?.blood_group && (
                                            <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                              {counterpart.blood_group}
                                            </span>
                                          )}
                                        </p>
                                      )}
                                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground capitalize">
                                        {location && (
                                          <>
                                            <MapPin className="size-3 shrink-0" />
                                            {location} ·{" "}
                                          </>
                                        )}
                                        {apt.appointment_type?.toLowerCase()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <CalendarDays className="size-3.5" />
                                      {formatDateForDisplay(apt.appointment_date.slice(0, 10))}
                                      {apt.appointment_time && ` · ${fromApiTime(apt.appointment_time)}`}
                                    </div>
                                    {status && (
                                      <span
                                        className={cn(
                                          "rounded-full px-2.5 py-1 text-xs font-medium",
                                          appointmentStatusStyles[status] ?? "bg-secondary text-secondary-foreground"
                                        )}
                                      >
                                        {status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {(apt.fee != null || apt.discount != null) && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {apt.fee != null && `Fee ৳${apt.fee}`}
                                    {apt.discount != null && ` · Discount ৳${apt.discount}`}
                                  </p>
                                )}
                                {isDoctor && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                    onClick={() => goToAppointmentPrescription(apt.id)}
                                  >
                                    <FilePlus />
                                    Create Prescription
                                  </Button>
                                )}
                              </div>
                            );
                          })
                        )}
                        {!appointmentsLoading &&
                          (appointmentsView === "upcoming" ? upcomingAppointments : allAppointments).length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                              No {appointmentsView} appointments.
                            </p>
                          )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "prescriptions" && isPatient && !isDoctor && (
                  <motion.div
                    key="prescriptions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <FileText className="size-4 text-primary" />
                        My Prescriptions
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Prescriptions issued by doctors you&apos;ve consulted.
                      </p>

                      <div className="mt-4 space-y-3">
                        {prescriptions.length === 0 && (
                          <p className="text-sm text-muted-foreground">No prescriptions yet.</p>
                        )}
                        {prescriptions.map((rx) => (
                          <div key={rx.id} className="rounded-xl border border-border/60 p-4">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{rx.doctorName}</p>
                                <p className="text-sm text-primary">{rx.specialty}</p>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <CalendarDays className="size-3.5" />
                                {rx.date}
                              </div>
                            </div>
                            <ul className="mt-3 space-y-1.5">
                              {rx.medicines.map((med) => (
                                <li key={med.name} className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">{med.name}</span>
                                  <span>· {med.dosage}</span>
                                  <span>· {med.duration}</span>
                                </li>
                              ))}
                            </ul>
                            {rx.notes && (
                              <p className="mt-3 text-sm text-muted-foreground italic">&ldquo;{rx.notes}&rdquo;</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "diagnostic-reports" && isPatient && (
                  <motion.div
                    key="diagnostic-reports"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <FlaskConical className="size-4 text-primary" />
                        Diagnostic Reports
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Test reports from diagnostic centres you&apos;ve visited.
                      </p>

                      <div className="mt-4 space-y-3">
                        {diagnosticReports.length === 0 && (
                          <p className="text-sm text-muted-foreground">No diagnostic reports yet.</p>
                        )}
                        {diagnosticReports.map((report) => (
                          <div
                            key={report.id}
                            className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{report.testName}</p>
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3.5" />
                                {report.centreName}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <CalendarDays className="size-3.5" />
                                {report.date}
                              </div>
                              <span
                                className={
                                  "rounded-full px-2.5 py-1 text-xs font-medium " +
                                  (report.status === "Ready"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary text-secondary-foreground")
                                }
                              >
                                {report.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "chamber" && isDoctor && (
                  <motion.div key="chamber" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <Building2 className="size-4 text-amber-600 dark:text-amber-400" />
                            Chambers
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            You can add more than one — each becomes an option in your Weekly Schedule.
                          </p>
                        </div>
                        {chamberFormOpen === null && (
                          <Button
                            size="sm"
                            className="border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                            onClick={openNewChamberForm}
                          >
                            <Plus />
                            Add Chamber
                          </Button>
                        )}
                      </div>

                      {chamberFormOpen === null && (
                        <div className="mt-5 space-y-3">
                          {chambers.length === 0 && (
                            <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                              No chambers added yet. Add your first one to start building your weekly schedule.
                            </p>
                          )}
                          {chambers.map((c) => (
                            <div key={c.id} className="rounded-xl border border-border/60 p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-foreground">{c.name}</p>
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-xs font-medium",
                                        c.is_active
                                          ? "bg-primary/10 text-primary"
                                          : "bg-secondary text-secondary-foreground"
                                      )}
                                    >
                                      {c.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  {(c.address || c.city || c.area) && (
                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <MapPin className="size-3.5 shrink-0" />
                                      {[c.address, c.area, c.city].filter(Boolean).join(", ")}
                                    </div>
                                  )}
                                  {c.consultation_fee != null && (
                                    <p className="mt-1 text-sm text-muted-foreground">Fee: ৳{c.consultation_fee}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {confirmDeleteChamberId === c.id ? (
                                    <>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteChamber(c.id)}
                                        disabled={deletingChamberId === c.id}
                                      >
                                        {deletingChamberId === c.id ? "Removing..." : "Confirm Remove"}
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteChamberId(null)}>
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                        onClick={() => goToChamberSchedule(c.id)}
                                      >
                                        <CalendarClock />
                                        Make Schedule
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon-sm"
                                        onClick={() => openEditChamberForm(c)}
                                        aria-label="Edit chamber"
                                      >
                                        <Pencil />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => setConfirmDeleteChamberId(c.id)}
                                        aria-label="Remove chamber"
                                      >
                                        <Trash2 />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {chamberFormOpen !== null && (
                        <div className="mt-5 space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="chamberName">Chamber Name</Label>
                            <Input id="chamberName" value={chamberName} onChange={(e) => setChamberName(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="chamberAddress">Address</Label>
                            <Input id="chamberAddress" value={chamberAddress} onChange={(e) => setChamberAddress(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="chamberCity">City</Label>
                              <Input id="chamberCity" value={chamberCity} onChange={(e) => setChamberCity(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="chamberArea">Area</Label>
                              <Input id="chamberArea" value={chamberArea} onChange={(e) => setChamberArea(e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="chamberFee">Consultation Fee</Label>
                            <Input
                              id="chamberFee"
                              type="number"
                              placeholder="e.g. 800"
                              value={chamberFee}
                              onChange={(e) => setChamberFee(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
                            <Label htmlFor="chamberActive" className="cursor-pointer">
                              Chamber is active
                            </Label>
                            <Switch id="chamberActive" checked={chamberActive} onCheckedChange={setChamberActive} />
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" onClick={() => setChamberFormOpen(null)}>
                              Cancel
                            </Button>
                            <Button
                              className="border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 sm:flex-1"
                              onClick={saveChamber}
                              disabled={savingChamber}
                            >
                              {savingChamber
                                ? "Saving..."
                                : typeof chamberFormOpen === "number"
                                  ? "Update Chamber"
                                  : "Add Chamber"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {activeTab === "schedule" && isDoctor && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {chambers.length === 0 ? (
                      <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-foreground">
                          <CalendarClock className="size-4 text-amber-600 dark:text-amber-400" />
                          Schedule
                        </h3>
                        <div className="mt-5 rounded-xl border border-dashed border-border/60 p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            Add at least one chamber before setting up your schedule.
                          </p>
                          <Button
                            variant="outline"
                            className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                            onClick={() => handleTabChange("chamber")}
                          >
                            <Building2 />
                            Go to Chambers
                          </Button>
                        </div>
                      </Card>
                    ) : scheduleChamber === null ? (
                      <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-foreground">
                          <Building2 className="size-4 text-amber-600 dark:text-amber-400" />
                          Select a Chamber
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Choose which chamber you want to manage the schedule for.
                        </p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {chambers.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => goToChamberSchedule(c.id)}
                              className="rounded-xl border border-border/60 p-4 text-left transition-colors hover:border-amber-400 hover:bg-amber-500/5"
                            >
                              <p className="font-semibold text-foreground">{c.name}</p>
                              {(c.address || c.city || c.area) && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="size-3 shrink-0" />
                                  {[c.address, c.area, c.city].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </Card>
                    ) : (
                      <>
                        <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                <CalendarClock className="size-4 text-amber-600 dark:text-amber-400" />
                                Schedule — {scheduleChamber.name}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Pick a date (or drag a range) on the calendar, choose how it repeats, then set the time slot.
                              </p>
                            </div>
                            {chambers.length > 1 && (
                              <div className="w-48 shrink-0 space-y-1">
                                <Label className="text-xs text-muted-foreground">Chamber</Label>
                                <Select
                                  value={String(scheduleChamberId)}
                                  onValueChange={(v) => goToChamberSchedule(Number(v))}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue>
                                      {(v: string) => chambers.find((c) => String(c.id) === v)?.name ?? v}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {chambers.map((c) => (
                                      <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <ScheduleCalendar events={chamberSchedules} range={scheduleRange} onRangeChange={setScheduleRange} />

                            <div className="space-y-3 rounded-xl border border-border/60 p-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                {scheduleRange.start
                                  ? scheduleRange.start === scheduleRange.end
                                    ? formatDateForDisplay(scheduleRange.start)
                                    : `${formatDateForDisplay(scheduleRange.start)} → ${formatDateForDisplay(scheduleRange.end as string)}`
                                  : "No date selected yet"}
                              </p>

                              <div className="space-y-1.5">
                                <Label>Repeats</Label>
                                <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceType)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="day">Day (every date in range)</SelectItem>
                                    <SelectItem value="weekly">Weekly (chosen weekdays)</SelectItem>
                                    <SelectItem value="monthly">Monthly (same date each month)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {recurrenceType === "weekly" && (
                                <div className="space-y-1.5">
                                  <Label>Repeat on</Label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {WEEKDAY_OPTIONS.map((w) => (
                                      <button
                                        key={w.value}
                                        type="button"
                                        onClick={() => toggleRecurrenceWeekday(w.value)}
                                        className={cn(
                                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                                          recurrenceWeekdays.includes(w.value)
                                            ? "border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                            : "border-border/60 text-muted-foreground hover:bg-secondary"
                                        )}
                                      >
                                        {w.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {recurrenceType === "monthly" && (
                                <div className="space-y-1.5">
                                  <Label htmlFor="recurrenceDayOfMonth">Day of month</Label>
                                  <Input
                                    id="recurrenceDayOfMonth"
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={recurrenceDayOfMonth}
                                    onChange={(e) => setRecurrenceDayOfMonth(e.target.value)}
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                  <Label htmlFor="slotStartTime">From</Label>
                                  <Input
                                    id="slotStartTime"
                                    type="time"
                                    value={slotStartTime}
                                    onChange={(e) => setSlotStartTime(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="slotEndTime">To</Label>
                                  <Input
                                    id="slotEndTime"
                                    type="time"
                                    value={slotEndTime}
                                    onChange={(e) => setSlotEndTime(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="slotFee">Consultation Fee (৳)</Label>
                                <Input
                                  id="slotFee"
                                  type="number"
                                  value={slotFee}
                                  onChange={(e) => setSlotFee(e.target.value)}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                  Suggested from the chamber&apos;s default fee — edit to override just this slot.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                  <Label htmlFor="slotDuration">Slot Duration (min)</Label>
                                  <Input
                                    id="slotDuration"
                                    type="number"
                                    placeholder="Optional"
                                    value={slotDuration}
                                    onChange={(e) => setSlotDuration(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="maxPatients">Max Patients</Label>
                                  <Input
                                    id="maxPatients"
                                    type="number"
                                    placeholder="Optional"
                                    value={maxPatients}
                                    onChange={(e) => setMaxPatients(e.target.value)}
                                  />
                                </div>
                              </div>

                              <Button
                                className="w-full border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                onClick={createSchedule}
                                disabled={savingSchedule}
                              >
                                {savingSchedule ? "Saving..." : "Submit"}
                              </Button>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6">
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                            List of Schedule
                          </h3>
                          {chamberSchedules.length === 0 ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                              No schedule slots yet for {scheduleChamber.name}.
                            </p>
                          ) : (
                            <div className="mt-4 space-y-2">
                              {chamberSchedules.map((s) => (
                                <div
                                  key={s.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {formatDateForDisplay(s.date.slice(0, 10))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {fromApiTime(s.start_time)} – {fromApiTime(s.end_time)}
                                      {s.consultation_fee != null && ` · ৳${s.consultation_fee}`}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteSchedule(s.id)}
                                    disabled={deletingScheduleId === s.id}
                                    aria-label="Remove slot"
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === "prescriptions" && isDoctor && (
                  <motion.div
                    key="prescriptions-doctor"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {!rxAppointment ? (
                      addAppointmentOpen ? (
                        addAppointmentPanel
                      ) : (
                        <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <FilePlus className="size-4 text-amber-600 dark:text-amber-400" />
                            Create Prescription
                          </h3>
                          <div className="mt-5 rounded-xl border border-dashed border-border/60 p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                              Prescriptions are tied to a specific appointment. Pick an existing one, or find/add a
                              patient and book one now — you&apos;ll land straight back here to write it up.
                            </p>
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
                              <Button variant="outline" onClick={() => handleTabChange("appointments")}>
                                <CalendarDays />
                                Go to Appointments
                              </Button>
                              <Button
                                className="border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                onClick={() => {
                                  setBookingFromPrescriptionsTab(true);
                                  setAddAppointmentOpen(true);
                                }}
                              >
                                <UserPlus />
                                Find or Add Patient
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    ) : createdPrescription ? (
                      <Card className="border-l-4 border-border/60 border-l-emerald-400 p-6 text-center">
                        <BadgeCheck className="mx-auto size-8 text-emerald-500" />
                        <h3 className="mt-2 font-semibold text-foreground">Prescription created</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Saved for appointment #{createdPrescription.appointment_id}.
                        </p>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                          <Button
                            className="border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                            onClick={() => window.print()}
                          >
                            <Printer />
                            Print Prescription
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCreatedPrescription(null);
                              setRxAppointmentId(null);
                              resetPrescriptionForm();
                              handleTabChange("appointments");
                            }}
                          >
                            Back to Appointments
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                              <FilePlus className="size-4 text-amber-600 dark:text-amber-400" />
                              Create Prescription
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              For {rxAppointment.user_patient?.name?.trim() || `Patient #${rxAppointment.user_patient_id}`} —
                              Appointment #{rxAppointment.id} ·{" "}
                              {formatDateForDisplay(rxAppointment.appointment_date.slice(0, 10))}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleTabChange("appointments")}>
                            Change Appointment
                          </Button>
                        </div>

                        <div className="mt-5 space-y-5">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Activity className="size-4 text-amber-600 dark:text-amber-400" />
                              Vitals
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="rxBpSystolic">BP Systolic</Label>
                                <Input
                                  id="rxBpSystolic"
                                  type="number"
                                  value={rxBpSystolic}
                                  onChange={(e) => setRxBpSystolic(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="rxBpDiastolic">BP Diastolic</Label>
                                <Input
                                  id="rxBpDiastolic"
                                  type="number"
                                  value={rxBpDiastolic}
                                  onChange={(e) => setRxBpDiastolic(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="rxPulse">Pulse</Label>
                                <Input
                                  id="rxPulse"
                                  type="number"
                                  value={rxPulse}
                                  onChange={(e) => setRxPulse(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="rxSugarLevel">Sugar Level</Label>
                                <Input
                                  id="rxSugarLevel"
                                  placeholder="e.g. 5.6 mmol/L"
                                  value={rxSugarLevel}
                                  onChange={(e) => setRxSugarLevel(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/60 p-3">
                              <Label htmlFor="rxIsSmoking" className="cursor-pointer">
                                Patient smokes
                              </Label>
                              <Switch id="rxIsSmoking" checked={rxIsSmoking} onCheckedChange={setRxIsSmoking} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="rxSymptoms">Symptoms</Label>
                              <Textarea id="rxSymptoms" value={rxSymptoms} onChange={(e) => setRxSymptoms(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="rxDiagnosis">Diagnosis</Label>
                              <Textarea
                                id="rxDiagnosis"
                                value={rxDiagnosis}
                                onChange={(e) => setRxDiagnosis(e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Pill className="size-4 text-amber-600 dark:text-amber-400" />
                                Medicines
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                onClick={addMedicineRow}
                              >
                                <Plus />
                                Add Medicine
                              </Button>
                            </div>
                            <div className="mt-2 space-y-3">
                              {rxMedicines.map((row, i) => (
                                <div key={i} className="rounded-xl border border-border/60 p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-medium text-muted-foreground">Medicine {i + 1}</p>
                                    {rxMedicines.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => removeMedicineRow(i)}
                                        aria-label="Remove medicine"
                                      >
                                        <Trash2 />
                                      </Button>
                                    )}
                                  </div>
                                  <MedicineSearchInput
                                    className="mt-2"
                                    value={row.name}
                                    onValueChange={(v) => updateMedicineRow(i, "name", v)}
                                    onSelectMedicine={(medicine) => selectMedicineForRow(i, medicine)}
                                  />
                                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <Input
                                      placeholder="Dose (e.g. 500mg)"
                                      value={row.dose}
                                      onChange={(e) => updateMedicineRow(i, "dose", e.target.value)}
                                    />
                                    <Input
                                      placeholder="Schedule (e.g. 1+0+1)"
                                      value={row.schedule}
                                      onChange={(e) => updateMedicineRow(i, "schedule", e.target.value)}
                                    />
                                    <Input
                                      placeholder="Duration (e.g. 7 days)"
                                      value={row.duration}
                                      onChange={(e) => updateMedicineRow(i, "duration", e.target.value)}
                                    />
                                  </div>
                                  <Input
                                    className="mt-2"
                                    placeholder="Notes (optional)"
                                    value={row.notes}
                                    onChange={(e) => updateMedicineRow(i, "notes", e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="rxDate">Prescription Date</Label>
                              <Input id="rxDate" type="date" value={rxDate} onChange={(e) => setRxDate(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="rxNotes">General Notes</Label>
                              <Input id="rxNotes" value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} />
                            </div>
                          </div>
                        </div>

                        <Button
                          className="mt-6 w-full border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 sm:w-auto"
                          onClick={createPrescription}
                          disabled={savingRx}
                        >
                          {savingRx ? "Saving..." : "Create Prescription"}
                        </Button>
                      </Card>
                    )}

                    {printablePrescription && (
                      // Print-only A4 layout — hidden on screen, revealed by the
                      // #prescription-print-area rule in globals.css.
                      <div id="prescription-print-area" className="hidden">
                        <div className="flex items-start justify-between border-b-2 border-foreground pb-4">
                          <div>
                            <p className="text-lg font-bold">Dr. {user?.name}</p>
                            {(myDoctorRecord?.title || myDoctorRecord?.specialization) && (
                              <p className="text-sm">
                                {[myDoctorRecord?.title, myDoctorRecord?.specialization].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            {myDoctorRecord?.license_number && (
                              <p className="text-xs">Reg. No: {myDoctorRecord.license_number}</p>
                            )}
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-semibold">Ibnocare</p>
                            <p>
                              {printablePrescription.prescription_date
                                ? formatDateForDisplay(printablePrescription.prescription_date.slice(0, 10))
                                : formatDateForDisplay(new Date().toISOString().slice(0, 10))}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <p>
                            <span className="font-semibold">Patient: </span>
                            {patientLabelForPrescription(printablePrescription)}
                          </p>
                          <p className="text-xs capitalize">{printablePrescription.appointment_type?.toLowerCase()} visit</p>
                        </div>

                        {(printablePrescription.blood_pressure_systolic != null ||
                          printablePrescription.blood_pressure_diastolic != null ||
                          printablePrescription.pulse != null ||
                          printablePrescription.sugar_level ||
                          printablePrescription.is_smoking) && (
                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-b border-dashed border-foreground/40 pb-3 text-xs">
                            {(printablePrescription.blood_pressure_systolic != null ||
                              printablePrescription.blood_pressure_diastolic != null) && (
                              <span>
                                BP: {printablePrescription.blood_pressure_systolic ?? "—"}/
                                {printablePrescription.blood_pressure_diastolic ?? "—"}
                              </span>
                            )}
                            {printablePrescription.pulse != null && <span>Pulse: {printablePrescription.pulse}</span>}
                            {printablePrescription.sugar_level && <span>Sugar: {printablePrescription.sugar_level}</span>}
                            <span>Smoking: {printablePrescription.is_smoking ? "Yes" : "No"}</span>
                          </div>
                        )}

                        {(printablePrescription.symptoms || printablePrescription.diagnosis) && (
                          <div className="mt-3 space-y-1 border-b border-dashed border-foreground/40 pb-3 text-sm">
                            {printablePrescription.symptoms && (
                              <p>
                                <span className="font-semibold">Symptoms: </span>
                                {printablePrescription.symptoms}
                              </p>
                            )}
                            {printablePrescription.diagnosis && (
                              <p>
                                <span className="font-semibold">Diagnosis: </span>
                                {printablePrescription.diagnosis}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4">
                          <p className="mb-2 text-2xl font-bold">℞</p>
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-foreground/60 text-left">
                                <th className="pb-1">Medicine</th>
                                <th className="pb-1">Dose</th>
                                <th className="pb-1">Schedule</th>
                                <th className="pb-1">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(printablePrescription.medicines ?? []).map((m, i) => (
                                <tr key={i} className="border-b border-foreground/20 align-top">
                                  <td className="py-1.5 pr-2 font-medium">{m.name}</td>
                                  <td className="py-1.5 pr-2">{m.dose || "—"}</td>
                                  <td className="py-1.5 pr-2">{m.schedule || "—"}</td>
                                  <td className="py-1.5">{m.duration || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {printablePrescription.notes && (
                          <p className="mt-4 text-sm">
                            <span className="font-semibold">Notes: </span>
                            {printablePrescription.notes}
                          </p>
                        )}

                        <div className="mt-16 flex justify-end">
                          <div className="w-56 border-t border-foreground pt-1 text-center text-xs">Signature</div>
                        </div>
                      </div>
                    )}

                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <FileText className="size-4 text-amber-600 dark:text-amber-400" />
                        Prescription History
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">Everything you&apos;ve prescribed, most recent first.</p>

                      <div className="mt-4 space-y-2">
                        {prescriptionHistoryLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : prescriptionHistory.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">No prescriptions yet.</p>
                        ) : (
                          prescriptionHistory.map((rx) => (
                            <div
                              key={rx.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">{patientLabelForPrescription(rx)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {rx.prescription_date ? formatDateForDisplay(rx.prescription_date.slice(0, 10)) : "—"} ·{" "}
                                  {(rx.medicines ?? []).length} medicine{(rx.medicines ?? []).length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                onClick={() => setViewingPrescription(rx)}
                              >
                                <Printer />
                                Print
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Left-side tab menu */}
            <div className="lg:order-1">
              <Card className="border-border/60 p-2 lg:sticky lg:top-24">
                {isDoctor && (
                  <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-amber-600 dark:text-amber-400">
                    <Stethoscope className="size-3.5 shrink-0" />
                    <p className="text-[11px] font-semibold tracking-wider uppercase">Doctor Tools</p>
                  </div>
                )}

                <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {(isDoctor ? doctorNavItems : isPatient ? patientNavItems : profileOnlyNavItems).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleTabChange(item.key)}
                      className={cn(
                        "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        activeTab === item.key
                          ? isDoctor
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/10 text-primary"
                          : isDoctor
                            ? "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                <Separator className="my-1.5" />
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                  className="flex w-full shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="size-4 shrink-0" />
                  Log Out
                </button>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageInner />
    </Suspense>
  );
}
