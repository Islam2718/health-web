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
  ChevronDown,
  ClipboardList,
  Clock,
  Droplet,
  Eye,
  FilePlus,
  FileText,
  FlaskConical,
  LogOut,
  MapPin,
  MessageCircle,
  Minus,
  Pencil,
  Phone,
  Pill,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  Stethoscope,
  Store,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users,
  X,
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
  fetchMyAppointments,
  updateAppointment,
  patientLookupAppointmentToRecord,
  type AppointmentRecord,
  type AppointmentType,
  type PatientLookupAppointment,
} from "@/lib/patient-lookup";
import {
  createAppointmentPrescription,
  fetchAppointmentPrescriptions,
  fetchMyPrescriptions,
  type MedicineEntry,
  type AppointmentPrescriptionRecord,
  type MyPrescriptionRecord,
} from "@/lib/prescriptions";
import type { PublicMedicineRecord } from "@/lib/medicines";
import { MedicineSearchInput } from "@/components/dashboard/medicine-search-input";
import { appointments, diagnosticReports, prescriptions } from "@/lib/dashboard-data";
import { fetchPosts, createPost, POST_TYPE_LABELS, type PostRecord, type PostType } from "@/lib/posts";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { stripHtmlToText } from "@/lib/safe-html";
import {
  fetchMyDonorInterest,
  updateDonorInterest,
  createDonation,
  fetchMyDonations,
  type DonationPatientGender,
  type BloodDonationRecord,
} from "@/lib/blood-donor";
import {
  fetchMyAmbulances,
  createAmbulance,
  updateAmbulance,
  deleteAmbulance,
  AMBULANCE_TYPE_OPTIONS,
  type AmbulanceRecord,
  type AmbulanceType,
} from "@/lib/ambulances";
import { TagInput } from "@/components/admin/tag-input";
import {
  fetchStores,
  createStore,
  updateStore,
  fetchStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  fetchStoreStocks,
  createStoreStock,
  createOrder,
  fetchOrders,
  updateOrderStatus,
  STOCK_TRANSACTION_TYPES,
  ORDER_STATUS_OPTIONS,
  type StoreRecord,
  type StoreProductRecord,
  type StoreStockRecord,
  type StockTransactionType,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/stores";
import { findCustomerByPhone, createCustomerByPhone } from "@/lib/customers";
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
  displayNameWithTitle,
  type ChamberRecord,
  type DoctorRecord,
  type DoctorScheduleRecord,
} from "@/lib/doctor-profile";
import {
  expandScheduleDates,
  toApiTime,
  fromApiTime,
  formatTimeDisplay,
  type RecurrenceType,
} from "@/lib/schedule-recurrence";

// Allowed values per the appointments API: APPOINTED, PRESCRIBED, DELETED,
// or null. (Previously PENDING/APPROVED/REJECTED/CANCELLED/COMPLETED/EXPIRED
// — the backend collapsed that into this smaller set: a booking is
// APPOINTED the moment it's created, no separate approval step; PRESCRIBED
// once a prescription's been written for it; DELETED if cancelled.)
const appointmentStatusStyles: Record<string, string> = {
  APPOINTED: "bg-primary/10 text-primary",
  PRESCRIBED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  DELETED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-secondary text-secondary-foreground",
};

// EXPIRED isn't an API value — it's computed client-side (see
// effectiveAppointmentStatus) and never sent back to the API.
const TERMINAL_APPOINTMENT_STATUSES = new Set(["PRESCRIBED", "DELETED", "EXPIRED"]);

// The API doesn't appear to flip a past-dated APPOINTED visit to anything
// once its date has passed — it just leaves the original status sitting
// there. Compute the display status client-side instead, so a doctor/patient
// scanning their list doesn't see an old visit still marked "Appointed" as
// if it were still upcoming.
function effectiveAppointmentStatus(apt: { status: string | null; appointment_date: string }): string {
  const status = apt.status?.toUpperCase() ?? "";
  if (TERMINAL_APPOINTMENT_STATUSES.has(status)) return status;
  const today = new Date().toISOString().slice(0, 10);
  if (status && apt.appointment_date.slice(0, 10) < today) return "EXPIRED";
  return status;
}

// A quieter left-edge accent per row so a doctor scanning a long list can
// tell cancelled/prescribed visits apart from active ones at a glance,
// without every status fighting for attention via a filled badge.
const appointmentBorderStyles: Record<string, string> = {
  APPOINTED: "border-l-primary",
  PRESCRIBED: "border-l-emerald-400",
  DELETED: "border-l-destructive/60",
  EXPIRED: "border-l-border",
};

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-primary/10 text-primary",
  processing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  shipped: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
};

type TabKey =
  | "profile"
  | "appointments"
  | "prescriptions"
  | "diagnostic-reports"
  | "chamber"
  | "schedule"
  | "my-appointments"
  | "my-prescriptions"
  | "posts"
  | "blood-donor"
  | "ambulances"
  | "store"
  | "store-products"
  | "store-stock"
  | "pos"
  | "store-orders";

type NavItem = { key: TabKey; label: string; icon: typeof UserIcon };

const patientNavItems: NavItem[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "diagnostic-reports", label: "Diagnostic Reports", icon: FlaskConical },
  { key: "posts", label: "My Posts", icon: MessageCircle },
  { key: "blood-donor", label: "Blood Donor", icon: Droplet },
];

const profileOnlyNavItems: NavItem[] = [{ key: "profile", label: "Profile", icon: UserIcon }];

// A doctor account is also a patient account underneath — they can book
// their own visits with other doctors, same as anyone else. This is the
// "wearing a patient hat" section of the menu: personal, not about running
// their own practice.
const doctorPersonalNavItems: NavItem[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "my-appointments", label: "My Appointments", icon: CalendarDays },
  { key: "my-prescriptions", label: "My Prescriptions", icon: FileText },
  { key: "diagnostic-reports", label: "Diagnostic Reports", icon: FlaskConical },
  { key: "posts", label: "My Posts", icon: MessageCircle },
  { key: "blood-donor", label: "Blood Donor", icon: Droplet },
];

// The "wearing a doctor hat" section — running their own practice: patients
// booking with them, prescriptions they write, their schedule and chamber.
// Kept as a visually separate group (behind the "Doctor Tools" divider) so
// it never looks like a duplicate of the personal section above, even
// though both sections can contain an "Appointments"/"Prescriptions" entry.
const doctorToolsNavItems: NavItem[] = [
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "prescriptions", label: "Prescriptions", icon: FileText },
  { key: "schedule", label: "Schedule", icon: CalendarClock },
  { key: "chamber", label: "Chamber", icon: Building2 },
];

// Ambulance and Store each get their own labeled section (same visual
// treatment as Doctor Tools above) instead of being flat items mixed into
// the personal list — both only show up once the user actually has one.
const ambulanceToolsNavItems: NavItem[] = [
  { key: "ambulances", label: "My Ambulances", icon: Ambulance },
];

const storeToolsNavItems: NavItem[] = [
  { key: "store", label: "Shop", icon: Store },
  { key: "store-products", label: "Products", icon: Pill },
  { key: "store-stock", label: "Stock", icon: Receipt },
  { key: "pos", label: "POS", icon: ShoppingCart },
  { key: "store-orders", label: "My Orders", icon: ClipboardList },
];

const ALL_TAB_KEYS: TabKey[] = [
  "profile",
  "appointments",
  "prescriptions",
  "diagnostic-reports",
  "chamber",
  "schedule",
  "my-appointments",
  "my-prescriptions",
  "posts",
  "blood-donor",
  "ambulances",
  "store",
  "store-products",
  "store-stock",
  "pos",
  "store-orders",
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

// Standard Morning+Noon+Night dose shorthand (BD prescription convention) —
// a picker instead of free typing, since it's always one of these handful
// of combinations. Includes explicit 3x/4x-daily entries since those don't
// map to a single obvious 3-slot pattern.
const MEDICINE_SCHEDULE_OPTIONS = [
  { value: "1+0+0", label: "1+0+0 — Morning only" },
  { value: "0+1+0", label: "0+1+0 — Noon only" },
  { value: "0+0+1", label: "0+0+1 — Night only" },
  { value: "1+1+0", label: "1+1+0 — Morning, Noon" },
  { value: "1+0+1", label: "1+0+1 — Morning, Night" },
  { value: "0+1+1", label: "0+1+1 — Noon, Night" },
  { value: "1+1+1", label: "1+1+1 — 3 times a day" },
  { value: "1+1+1+1", label: "1+1+1+1 — 4 times a day" },
  { value: "SOS", label: "SOS — as needed" },
];

const MEDICINE_TIMING_OPTIONS = [
  { value: "Before meal", label: "Before Meal (খাবারের আগে)" },
  { value: "After meal", label: "After Meal (খাবারের পরে)" },
];

function getCurrentTimeHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatDateForDisplay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// Groups an appointment list under "Today" / "Tomorrow" / a full date, in
// the order the entries already arrive in (so callers should pre-sort by
// date first) — lets a doctor scan a busy day without the date repeating on
// every single row.
function groupAppointmentsByDate<T extends { appointment_date: string }>(items: T[]) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const tomorrowKey = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const groups: { key: string; label: string; items: T[] }[] = [];
  for (const item of items) {
    const key = item.appointment_date.slice(0, 10);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const label =
        key === todayKey ? "Today" : key === tomorrowKey ? "Tomorrow" : formatDateForDisplay(key);
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
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
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    updateProfile,
    logout,
    isBloodDonor,
    hasAmbulance,
    hasStore,
    storeId: contextStoreId,
    setIsBloodDonor,
    setHasAmbulance,
    setStore,
  } = useAuth();
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
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentRecord[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentRecord[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [updatingAppointmentStatusId, setUpdatingAppointmentStatusId] = useState<number | null>(null);

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
  const [patientPhone, setPatientPhone] = useState("");
  const [patientSearching, setPatientSearching] = useState(false);
  const [patientSearched, setPatientSearched] = useState(false);
  const [foundPatient, setFoundPatient] = useState<ApiUser | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<ApiUser | null>(null);
  // Appointments this patient already has with the doctor — comes back
  // alongside the phone-lookup response, so a doctor can jump straight into
  // writing a prescription for an existing visit instead of always booking
  // a new one.
  const [patientAppointments, setPatientAppointments] = useState<PatientLookupAppointment[]>([]);
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
  // Defaults to right now, same reasoning as the date default above.
  const [apptTime, setApptTime] = useState(getCurrentTimeHHMM);
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
  const [rxIsDiabetic, setRxIsDiabetic] = useState(false);
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
  // Shown only on the Prescriptions tab's landing/gate screen, before the
  // doctor has picked an appointment to write a new prescription for.
  const [prescriptionHistory, setPrescriptionHistory] = useState<AppointmentPrescriptionRecord[]>([]);
  const [prescriptionHistoryLoading, setPrescriptionHistoryLoading] = useState(true);
  const [viewingPrescription, setViewingPrescription] = useState<AppointmentPrescriptionRecord | null>(null);
  // The prescription shown in the "View Details" dialog — a modal instead
  // of expanding a row in place, since expand-in-place doesn't scale once a
  // list has a hundred-plus prescriptions in it.
  const [prescriptionDetailsView, setPrescriptionDetailsView] = useState<AppointmentPrescriptionRecord | null>(null);
  // GET /my-prescriptions — prescriptions issued to this account as a
  // patient (used by both plain patients and doctors wearing their patient
  // hat on "My Prescriptions").
  const [myPrescriptions, setMyPrescriptions] = useState<MyPrescriptionRecord[]>([]);
  const [myPrescriptionsLoading, setMyPrescriptionsLoading] = useState(true);
  // GET /my-appointments — appointments where this account is the patient,
  // regardless of who the doctor is. Distinct from /appointments, which for
  // a doctor token returns their own doctor-side appointments instead.
  const [myAppointments, setMyAppointments] = useState<AppointmentRecord[]>([]);
  const [myAppointmentsLoading, setMyAppointmentsLoading] = useState(true);

  // Community posts — no dedicated "my posts" endpoint exists yet, so this
  // fetches the public list and filters to the current user client-side.
  const [myPosts, setMyPosts] = useState<PostRecord[]>([]);
  const [myPostsLoading, setMyPostsLoading] = useState(true);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  // Blood Donor tab — opt in/out, log a donation, view own donation history.
  // The interest flag itself lives in AuthContext (isBloodDonor), not here,
  // so it survives navigating away from the dashboard and back.
  const [donorInterestLoading, setDonorInterestLoading] = useState(true);
  const [updatingDonorInterest, setUpdatingDonorInterest] = useState(false);
  const [donorBloodGroup, setDonorBloodGroup] = useState("");
  const [savingDonorBloodGroup, setSavingDonorBloodGroup] = useState(false);
  const [myDonations, setMyDonations] = useState<BloodDonationRecord[]>([]);
  const [myDonationsLoading, setMyDonationsLoading] = useState(true);
  const [logDonationOpen, setLogDonationOpen] = useState(false);
  const [donationPatientName, setDonationPatientName] = useState("");
  const [donationPatientGender, setDonationPatientGender] = useState<DonationPatientGender | "">("");
  const [donationPatientBloodGroup, setDonationPatientBloodGroup] = useState("");
  const [donationPatientDisease, setDonationPatientDisease] = useState("");
  const [donationDate, setDonationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [donationHospitalName, setDonationHospitalName] = useState("");
  const [donationHospitalAddress, setDonationHospitalAddress] = useState("");
  const [donationUnits, setDonationUnits] = useState("1");
  const [donationNotes, setDonationNotes] = useState("");
  const [savingDonation, setSavingDonation] = useState(false);

  // My Ambulances tab — register/manage multiple vehicles, same
  // list + inline add/edit form + confirm-delete shape used for a doctor's
  // education/experience entries.
  const [myAmbulances, setMyAmbulances] = useState<AmbulanceRecord[]>([]);
  const [myAmbulancesLoading, setMyAmbulancesLoading] = useState(true);
  const [ambulanceFormOpen, setAmbulanceFormOpen] = useState<"new" | number | null>(null);
  const [ambulanceBrandModel, setAmbulanceBrandModel] = useState("");
  const [ambulanceLicensePlate, setAmbulanceLicensePlate] = useState("");
  const [ambulancePhone, setAmbulancePhone] = useState("");
  const [ambulanceType, setAmbulanceType] = useState<AmbulanceType | "">("");
  const [ambulanceEquipment, setAmbulanceEquipment] = useState<string[]>([]);
  const [ambulanceDescription, setAmbulanceDescription] = useState("");
  const [ambulanceAddress, setAmbulanceAddress] = useState("");
  const [ambulanceIsActive, setAmbulanceIsActive] = useState(true);
  const [savingAmbulance, setSavingAmbulance] = useState(false);
  const [confirmDeleteAmbulanceId, setConfirmDeleteAmbulanceId] = useState<number | null>(null);
  const [deletingAmbulanceId, setDeletingAmbulanceId] = useState<number | null>(null);

  // My Store tab — register a store, add medicines to it as store products,
  // log stock transactions against each, and sell via the POS tab below.
  const [myStore, setMyStore] = useState<StoreRecord | null>(null);
  const [myStoreLoading, setMyStoreLoading] = useState(true);
  const [storeFormOpen, setStoreFormOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeLicense, setStoreLicense] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [savingStore, setSavingStore] = useState(false);

  const [storeProducts, setStoreProducts] = useState<StoreProductRecord[]>([]);
  const [storeProductsLoading, setStoreProductsLoading] = useState(true);
  const [productFormOpen, setProductFormOpen] = useState<"new" | number | null>(null);
  const [productMedicineId, setProductMedicineId] = useState<number | null>(null);
  const [productMedicineQuery, setProductMedicineQuery] = useState("");
  const [productBuyPrice, setProductBuyPrice] = useState("");
  const [productSalePrice, setProductSalePrice] = useState("");
  const [productWholesalePrice, setProductWholesalePrice] = useState("");
  const [productMinStock, setProductMinStock] = useState("");
  const [productIsActive, setProductIsActive] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const [storeStocks, setStoreStocks] = useState<StoreStockRecord[]>([]);
  const [storeStocksLoading, setStoreStocksLoading] = useState(true);
  const [stockFormOpen, setStockFormOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [stockType, setStockType] = useState<StockTransactionType>("purchase");
  const [stockUnitPrice, setStockUnitPrice] = useState("");
  const [stockRemarks, setStockRemarks] = useState("");
  const [stockDate, setStockDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [savingStock, setSavingStock] = useState(false);

  // POS tab — a cart against the store's own active products, checked out
  // through the real Order API.
  const [posQuery, setPosQuery] = useState("");
  const [posCart, setPosCart] = useState<{ productId: number; name: string; price: number; qty: number }[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState("Cash");
  const [posDiscount, setPosDiscount] = useState("");
  const [posDeliveryFee, setPosDeliveryFee] = useState("");
  const [posNotes, setPosNotes] = useState("");
  const [posSubmitting, setPosSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  // Snapshot of whoever the customer was at checkout time — the Order API
  // only echoes back a bare customer_id, no nested name/address, so this is
  // the only way the invoice can print a customer name at all.
  const [lastOrderCustomer, setLastOrderCustomer] = useState<ApiUser | null>(null);
  // Which invoice size to render for print — set right before window.print()
  // fires, cleared again on afterprint (same pattern already proven for the
  // prescription print area).
  const [printInvoiceMode, setPrintInvoiceMode] = useState<"80mm" | "a4" | null>(null);

  // POS customer step — search-by-phone first, offer to register on the spot
  // if nothing matches. Entirely optional: an empty phone means a walk-in
  // sale with no customer_id sent at all.
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posCustomer, setPosCustomer] = useState<ApiUser | null>(null);
  const [posCustomerLoading, setPosCustomerLoading] = useState(false);
  const [posCustomerNotFound, setPosCustomerNotFound] = useState(false);
  const [posNewCustomerName, setPosNewCustomerName] = useState("");
  const [posCustomerCreating, setPosCustomerCreating] = useState(false);

  // My Orders tab — the store's order history, plus a details dialog with
  // status updates (same "View Details" modal shape used for prescriptions).
  const [storeOrders, setStoreOrders] = useState<OrderRecord[]>([]);
  const [storeOrdersLoading, setStoreOrdersLoading] = useState(true);
  const [storeOrdersFailed, setStoreOrdersFailed] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "all">("all");
  const [orderDetailsView, setOrderDetailsView] = useState<OrderRecord | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

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

  useEffect(() => {
    if (!isDoctor || !token) return;
    refreshPrescriptionHistory();
  }, [isDoctor, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) return;
    refreshMyPrescriptions();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) return;
    refreshMyAppointments();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    refreshMyPosts();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !token) return;
    refreshDonorInterest();
    refreshMyDonations();
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !token) return;
    refreshMyAmbulances();
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !token) return;
    refreshMyStore();
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token || !myStore) {
      setStoreProductsLoading(false);
      setStoreStocksLoading(false);
      setStoreOrdersLoading(false);
      return;
    }
    refreshStoreProducts();
    refreshStoreStocks();
    refreshStoreOrders();
  }, [token, myStore?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewingPrescription) return;
    window.print();
    // Clear it once the print dialog closes (printed or cancelled) so
    // clicking "Print" again on the same record re-fires this effect
    // instead of silently no-opping because the state didn't change.
    const clear = () => setViewingPrescription(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, [viewingPrescription]);

  useEffect(() => {
    if (!printInvoiceMode) return;
    window.print();
    const clear = () => setPrintInvoiceMode(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, [printInvoiceMode]);

  // Auto-search once a full phone number has been typed, so a compounder
  // can just type the number and see the match without an extra click —
  // Enter or the search button still work immediately for anyone who
  // doesn't want to wait out the debounce.
  useEffect(() => {
    const phone = posCustomerPhone.trim();
    if (posCustomer || phone.length < 10) return;
    const handle = setTimeout(() => searchPosCustomer(), 500);
    return () => clearTimeout(handle);
  }, [posCustomerPhone]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleChamber = chambers.find((c) => c.id === scheduleChamberId) ?? null;
  const chamberSchedules = schedules
    .filter((s) => s.chamber_id === scheduleChamberId)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time ?? "").localeCompare(b.start_time ?? ""));

  const rxAppointment =
    [...upcomingAppointments, ...allAppointments].find((a) => a.id === rxAppointmentId) ?? null;

  // Shown in the hidden print area once a prescription has been created, or
  // when the doctor picks "Print" on a past prescription from the history list.
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
      const result = await findPatientByPhone(token, phone);
      setFoundPatient(result?.patient ?? null);
      setPatientSearched(true);
      setPatientSearching(false);
      if (result) {
        setSelectedPatient(result.patient);
        setPatientAppointments(result.appointments);
      }
    }, 450);
    return () => clearTimeout(handle);
  }, [patientPhone, token, selectedPatient]);

  const resetPatientSearch = () => {
    setPatientPhone("");
    setFoundPatient(null);
    setPatientSearched(false);
    setSelectedPatient(null);
    setPatientAppointments([]);
    setNewPatientName("");
    setNewPatientEmail("");
    setNewPatientGender("");
    setNewPatientDob("");
    setNewPatientAddress("");
    setNewPatientBloodGroup("");
    setApptChamberId(null);
    setApptScheduleId(null);
    setApptDate(new Date().toISOString().slice(0, 10));
    setApptTime(getCurrentTimeHHMM());
    setApptFee("");
    setApptDiscount("");
  };

  // No chambers registered at all — a chamber visit isn't a valid option,
  // so lock the type to Online and skip the chamber picker entirely rather
  // than showing a select with nothing meaningful to choose.
  useEffect(() => {
    if (chambers.length === 0 && apptType === "CHAMBER") setApptType("ONLINE");
  }, [chambers.length, apptType]);

  // Auto-pick the first chamber instead of leaving the doctor to make a
  // choice that, most of the time, only has one real answer anyway.
  useEffect(() => {
    if (apptType !== "CHAMBER" || apptChamberId != null || chambers.length === 0) return;
    const first = chambers[0];
    setApptChamberId(first.id);
    if (first.consultation_fee != null) setApptFee(String(first.consultation_fee));
  }, [apptType, apptChamberId, chambers]);

  // A found appointment already has whatever the phone-lookup returned —
  // merge it into the same upcoming/all lists the rest of the app reads
  // from, so `rxAppointment` resolves immediately without waiting on a
  // refetch, then jump straight into the prescription form for it.
  const goToPrescriptionForFoundAppointment = (apt: PatientLookupAppointment) => {
    if (!selectedPatient) return;
    const record = patientLookupAppointmentToRecord(apt, selectedPatient);
    const merge = (list: AppointmentRecord[]) =>
      list.some((a) => a.id === record.id) ? list.map((a) => (a.id === record.id ? record : a)) : [record, ...list];
    setUpcomingAppointments(merge);
    setAllAppointments(merge);
    goToAppointmentPrescription(record.id);
  };

  const createPatient = async () => {
    if (!token) return;
    if (!patientPhone.trim() || !newPatientName.trim()) {
      toast.error("Phone number and name are required.");
      return;
    }
    setSavingPatient(true);
    try {
      const result = await findOrCreatePatientByPhone(token, patientPhone.trim(), {
        name: newPatientName,
        email: newPatientEmail || undefined,
        gender: newPatientGender || undefined,
        date_of_birth: newPatientDob || undefined,
        address: newPatientAddress || undefined,
        blood_group: newPatientBloodGroup || undefined,
      });
      setFoundPatient(result.patient);
      setSelectedPatient(result.patient);
      setPatientAppointments(result.appointments);
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
        status: "APPOINTED",
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
      // Booking from the Prescriptions tab's "Find or Add Patient" panel
      // means the goal was always to write a prescription — jump straight
      // there instead of just closing the panel.
      if (activeTab === "prescriptions") {
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
    const allowedDoctorTabs = [
      "chamber",
      "schedule",
      "my-appointments",
      "my-prescriptions",
      "posts",
      "blood-donor",
      "ambulances",
      "store",
      "store-products",
      "store-stock",
      "pos",
      "store-orders",
    ];
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

  // A booking is APPOINTED the moment it's created — there's no separate
  // approval step anymore, so the only status change a doctor makes here is
  // cancelling a visit that isn't happening. PUT /appointments/{id} takes
  // the full record back, so we rebuild it from the existing row plus the
  // new status rather than sending a partial patch.
  const handleCancelAppointment = async (apt: AppointmentRecord) => {
    if (!token) return;
    setUpdatingAppointmentStatusId(apt.id);
    try {
      await updateAppointment(token, apt.id, {
        user_doctor_id: apt.user_doctor_id,
        hospital_id: apt.hospital_id,
        chamber_id: apt.chamber_id,
        doctor_schedule_id: apt.doctor_schedule_id,
        fee: apt.fee != null ? Number(apt.fee) : undefined,
        discount: apt.discount != null ? Number(apt.discount) : undefined,
        appointment_type: apt.appointment_type,
        status: "DELETED",
        appointment_date: apt.appointment_date.slice(0, 10),
        appointment_time: apt.appointment_time ?? undefined,
      });
      // Patch only the field we know we changed — the PUT response's other
      // fields (nested user_patient/user_doctor especially) aren't reliably
      // shaped the same as the GET endpoints, and spreading it wholesale
      // over the existing record has been seen to blank out or corrupt the
      // patient info that was already correct.
      const patch = (list: AppointmentRecord[]) =>
        list.map((a) => (a.id === apt.id ? { ...a, status: "DELETED" } : a));
      setUpcomingAppointments(patch);
      setAllAppointments(patch);
      toast.success("Appointment cancelled");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not update the appointment."));
    } finally {
      setUpdatingAppointmentStatusId(null);
    }
  };

  const refreshPrescriptionHistory = async () => {
    if (!token) return;
    setPrescriptionHistoryLoading(true);
    const history = await fetchAppointmentPrescriptions(token);
    setPrescriptionHistory(history);
    setPrescriptionHistoryLoading(false);
  };

  const refreshMyPrescriptions = async () => {
    if (!token) return;
    setMyPrescriptionsLoading(true);
    const mine = await fetchMyPrescriptions(token);
    setMyPrescriptions(mine);
    setMyPrescriptionsLoading(false);
  };

  const refreshMyAppointments = async () => {
    if (!token) return;
    setMyAppointmentsLoading(true);
    const mine = await fetchMyAppointments(token);
    setMyAppointments(mine);
    setMyAppointmentsLoading(false);
  };

  const refreshMyPosts = async () => {
    if (!user) return;
    setMyPostsLoading(true);
    const { posts } = await fetchPosts({ per_page: 100 });
    setMyPosts(posts.filter((p) => p.user_id === user.id));
    setMyPostsLoading(false);
  };

  // Client-side only — there's no draft field/endpoint in the API, so this
  // just remembers an in-progress post on this device via localStorage.
  const POST_DRAFT_KEY = "ibnocare_post_draft";

  const openNewPost = () => {
    try {
      const saved = localStorage.getItem(POST_DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as { title?: string; body?: string };
        setNewPostTitle(draft.title ?? "");
        setNewPostBody(draft.body ?? "");
        toast("Draft restored");
      }
    } catch {
      // Malformed or unavailable storage — just start with a blank form.
    }
    setNewPostOpen(true);
  };

  const saveDraft = () => {
    if (!newPostTitle.trim() && !newPostBody.trim()) {
      toast.error("Nothing to save yet.");
      return;
    }
    try {
      localStorage.setItem(POST_DRAFT_KEY, JSON.stringify({ title: newPostTitle, body: newPostBody }));
      toast.success("Draft saved on this device");
    } catch {
      toast.error("Could not save draft on this device.");
    }
  };

  const createPostSubmit = async () => {
    if (!token) return;
    if (!newPostTitle.trim()) {
      toast.error("Give your post a title.");
      return;
    }
    if (!newPostBody.trim()) {
      toast.error("Write something before posting.");
      return;
    }
    setSavingPost(true);
    try {
      const post = await createPost(token, {
        title: newPostTitle.trim(),
        body: newPostBody.trim(),
        // Not a user choice — a doctor's post is a Doctor Post, everyone
        // else's is a Patient Issue, decided by their account type.
        type: isDoctor ? "DOCTOR_POST" : "PATIENT_ISSUE",
        is_public: true,
      });
      setMyPosts((list) => [post, ...list]);
      setNewPostTitle("");
      setNewPostBody("");
      setNewPostOpen(false);
      try {
        localStorage.removeItem(POST_DRAFT_KEY);
      } catch {
        // Not critical if this fails.
      }
      toast.success("Post published");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not publish your post."));
    } finally {
      setSavingPost(false);
    }
  };

  const refreshDonorInterest = async () => {
    if (!token || !user) return;
    setDonorInterestLoading(true);
    const interested = await fetchMyDonorInterest(token, user.id);
    setIsBloodDonor(interested);
    setDonorInterestLoading(false);
  };

  const refreshMyDonations = async () => {
    if (!token) return;
    setMyDonationsLoading(true);
    const donations = await fetchMyDonations(token);
    setMyDonations(donations);
    setMyDonationsLoading(false);
  };

  const toggleDonorInterest = async (next: boolean) => {
    if (!token) return;
    setUpdatingDonorInterest(true);
    try {
      const confirmed = await updateDonorInterest(token, next);
      setIsBloodDonor(confirmed);
      toast.success(confirmed ? "You're now listed as an available donor" : "Removed from the donor list");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not update your donor status."));
    } finally {
      setUpdatingDonorInterest(false);
    }
  };

  const saveDonorBloodGroup = async () => {
    if (!donorBloodGroup) {
      toast.error("Pick a blood group first.");
      return;
    }
    setSavingDonorBloodGroup(true);
    const result = await updateProfile({ blood_group: donorBloodGroup });
    setSavingDonorBloodGroup(false);
    if (!result.success) {
      toast.error(result.message ?? "Could not save your blood group.");
      return;
    }
    toast.success("Blood group saved");
  };

  const submitDonation = async () => {
    if (!token) return;
    if (!donationPatientName.trim()) {
      toast.error("Enter the patient's name.");
      return;
    }
    if (!donationDate) {
      toast.error("Pick a donation date.");
      return;
    }
    const units = Number(donationUnits);
    if (!units || units < 1) {
      toast.error("Units must be at least 1.");
      return;
    }
    setSavingDonation(true);
    try {
      const donation = await createDonation(token, {
        patient_name: donationPatientName.trim(),
        patient_gender: donationPatientGender || undefined,
        patient_disease: donationPatientDisease.trim() || undefined,
        patient_blood_group: donationPatientBloodGroup || undefined,
        donation_date: new Date(donationDate).toISOString(),
        hospital_name: donationHospitalName.trim() || undefined,
        hospital_address: donationHospitalAddress.trim() || undefined,
        units,
        notes: donationNotes.trim() || undefined,
      });
      setMyDonations((list) => [donation, ...list]);
      setDonationPatientName("");
      setDonationPatientGender("");
      setDonationPatientBloodGroup("");
      setDonationPatientDisease("");
      setDonationDate(new Date().toISOString().slice(0, 10));
      setDonationHospitalName("");
      setDonationHospitalAddress("");
      setDonationUnits("1");
      setDonationNotes("");
      setLogDonationOpen(false);
      toast.success("Donation logged");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not log this donation."));
    } finally {
      setSavingDonation(false);
    }
  };

  const refreshMyAmbulances = async () => {
    if (!token) return;
    setMyAmbulancesLoading(true);
    const list = await fetchMyAmbulances(token);
    setMyAmbulances(list);
    setHasAmbulance(list.length > 0);
    setMyAmbulancesLoading(false);
  };

  const openNewAmbulanceForm = () => {
    setAmbulanceBrandModel("");
    setAmbulanceLicensePlate("");
    setAmbulancePhone(user?.phone ?? "");
    setAmbulanceType("");
    setAmbulanceEquipment([]);
    setAmbulanceDescription("");
    setAmbulanceAddress("");
    setAmbulanceIsActive(true);
    setAmbulanceFormOpen("new");
  };

  const openEditAmbulanceForm = (a: AmbulanceRecord) => {
    setAmbulanceBrandModel(a.brand_model ?? "");
    setAmbulanceLicensePlate(a.license_plate_number);
    setAmbulancePhone(a.phone_number);
    setAmbulanceType(a.ambulance_type ?? "");
    setAmbulanceEquipment(a.equipment_list ?? []);
    setAmbulanceDescription(a.description ?? "");
    setAmbulanceAddress(a.address ?? "");
    setAmbulanceIsActive(a.is_active);
    setAmbulanceFormOpen(a.id);
  };

  const saveAmbulance = async () => {
    if (!token) return;
    if (!ambulanceLicensePlate.trim()) {
      toast.error("Enter the license plate number.");
      return;
    }
    if (!ambulancePhone.trim()) {
      toast.error("Enter a contact phone number.");
      return;
    }
    setSavingAmbulance(true);
    const isEditing = typeof ambulanceFormOpen === "number";
    try {
      const payload = {
        brand_model: ambulanceBrandModel.trim() || undefined,
        license_plate_number: ambulanceLicensePlate.trim(),
        phone_number: ambulancePhone.trim(),
        ambulance_type: ambulanceType || undefined,
        equipment_list: ambulanceEquipment.length > 0 ? ambulanceEquipment : undefined,
        description: ambulanceDescription.trim() || undefined,
        address: ambulanceAddress.trim() || undefined,
        is_active: ambulanceIsActive,
      };
      const saved = isEditing
        ? await updateAmbulance(token, ambulanceFormOpen as number, payload)
        : await createAmbulance(token, payload);
      const next = isEditing
        ? myAmbulances.map((a) => (a.id === saved.id ? saved : a))
        : [saved, ...myAmbulances];
      setMyAmbulances(next);
      setHasAmbulance(next.length > 0);
      toast.success(isEditing ? "Ambulance updated" : "Ambulance registered");
      setAmbulanceFormOpen(null);
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save this ambulance."));
    } finally {
      setSavingAmbulance(false);
    }
  };

  const removeAmbulance = async (id: number) => {
    if (!token) return;
    setDeletingAmbulanceId(id);
    try {
      await deleteAmbulance(token, id);
      const next = myAmbulances.filter((a) => a.id !== id);
      setMyAmbulances(next);
      setHasAmbulance(next.length > 0);
      toast.success("Ambulance removed");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not remove that ambulance."));
    } finally {
      setDeletingAmbulanceId(null);
      setConfirmDeleteAmbulanceId(null);
    }
  };

  const refreshMyStore = async () => {
    if (!token) return;
    setMyStoreLoading(true);
    const { stores } = await fetchStores(token);
    const store = stores[0] ?? null;
    setMyStore(store);
    setStore(store?.id ?? null);
    if (store) {
      setStoreName(store.store_name);
      setStoreAddress(store.store_address);
      setStoreLicense(store.trade_license_no);
      setStorePhone(store.phone ?? "");
      setStoreEmail(store.email ?? "");
      setStoreDescription(store.description ?? "");
    }
    setMyStoreLoading(false);
  };

  const openCreateStoreForm = () => {
    setStoreName("");
    setStoreAddress("");
    setStoreLicense("");
    setStorePhone(user?.phone ?? "");
    setStoreEmail(user?.email ?? "");
    setStoreDescription("");
    setStoreFormOpen(true);
  };

  const openEditStoreForm = () => {
    if (!myStore) return;
    setStoreName(myStore.store_name);
    setStoreAddress(myStore.store_address);
    setStoreLicense(myStore.trade_license_no);
    setStorePhone(myStore.phone ?? "");
    setStoreEmail(myStore.email ?? "");
    setStoreDescription(myStore.description ?? "");
    setStoreFormOpen(true);
  };

  const saveStore = async () => {
    if (!token) return;
    if (!storeName.trim() || !storeAddress.trim() || !storeLicense.trim()) {
      toast.error("Store name, address, and trade license number are required.");
      return;
    }
    setSavingStore(true);
    try {
      const payload = {
        store_name: storeName.trim(),
        store_address: storeAddress.trim(),
        trade_license_no: storeLicense.trim(),
        phone: storePhone.trim() || undefined,
        email: storeEmail.trim() || undefined,
        description: storeDescription.trim() || undefined,
      };
      const saved = myStore
        ? await updateStore(token, myStore.id, payload)
        : await createStore(token, payload);
      setMyStore(saved);
      setStore(saved.id);
      toast.success(myStore ? "Store updated" : "Store registered");
      setStoreFormOpen(false);
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save your store."));
    } finally {
      setSavingStore(false);
    }
  };

  const refreshStoreProducts = async () => {
    if (!token || !myStore) return;
    setStoreProductsLoading(true);
    const { products } = await fetchStoreProducts(token, myStore.id);
    setStoreProducts(products);
    setStoreProductsLoading(false);
  };

  const openNewProductForm = () => {
    setProductMedicineId(null);
    setProductMedicineQuery("");
    setProductBuyPrice("");
    setProductSalePrice("");
    setProductWholesalePrice("");
    setProductMinStock("");
    setProductIsActive(true);
    setProductFormOpen("new");
  };

  const openEditProductForm = (p: StoreProductRecord) => {
    setProductMedicineId(p.medicine_id);
    setProductMedicineQuery(p.medicine_name ?? "");
    setProductBuyPrice(String(p.buy_price));
    setProductSalePrice(String(p.sale_price));
    setProductWholesalePrice(String(p.wholesale_price));
    setProductMinStock(p.minimum_stock != null ? String(p.minimum_stock) : "");
    setProductIsActive(p.is_active);
    setProductFormOpen(p.id);
  };

  const saveProduct = async () => {
    if (!token || !myStore) return;
    if (!productMedicineId) {
      toast.error("Search and select a medicine first.");
      return;
    }
    if (!productBuyPrice.trim() || !productSalePrice.trim() || !productWholesalePrice.trim()) {
      toast.error("Enter buy, sale, and wholesale prices.");
      return;
    }
    setSavingProduct(true);
    const isEditing = typeof productFormOpen === "number";
    try {
      const payload = {
        medicine_id: productMedicineId,
        buy_price: Number(productBuyPrice),
        sale_price: Number(productSalePrice),
        wholesale_price: Number(productWholesalePrice),
        minimum_stock: productMinStock.trim() ? Number(productMinStock) : undefined,
        is_active: productIsActive,
      };
      const saved = isEditing
        ? await updateStoreProduct(token, myStore.id, productFormOpen as number, payload)
        : await createStoreProduct(token, myStore.id, payload);
      setStoreProducts((list) =>
        isEditing ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]
      );
      toast.success(isEditing ? "Product updated" : "Product added to store");
      setProductFormOpen(null);

      if (!isEditing) {
        // A brand-new product has zero stock — send the user straight into
        // logging its first stock entry instead of leaving them to find
        // the Stock tab and reselect it themselves.
        setStockProductId(String(saved.id));
        setStockQuantity("1");
        setStockType("purchase");
        setStockUnitPrice(String(saved.buy_price));
        setStockRemarks("");
        setStockDate(new Date().toISOString().slice(0, 10));
        setStockFormOpen(true);
        handleTabChange("store-stock");
      }
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save this product."));
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (id: number) => {
    if (!token || !myStore) return;
    setDeletingProductId(id);
    try {
      await deleteStoreProduct(token, myStore.id, id);
      setStoreProducts((list) => list.filter((p) => p.id !== id));
      toast.success("Product removed");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not remove that product."));
    } finally {
      setDeletingProductId(null);
      setConfirmDeleteProductId(null);
    }
  };

  const refreshStoreStocks = async () => {
    if (!token || !myStore) return;
    setStoreStocksLoading(true);
    const { stocks } = await fetchStoreStocks(token, myStore.id);
    setStoreStocks(stocks);
    setStoreStocksLoading(false);
  };

  const openStockForm = () => {
    setStockProductId(storeProducts[0] ? String(storeProducts[0].id) : "");
    setStockQuantity("1");
    setStockType("purchase");
    setStockUnitPrice("");
    setStockRemarks("");
    setStockDate(new Date().toISOString().slice(0, 10));
    setStockFormOpen(true);
  };

  const saveStockTransaction = async () => {
    if (!token || !myStore) return;
    if (!stockProductId) {
      toast.error("Select a product first.");
      return;
    }
    const quantity = Number(stockQuantity);
    if (!quantity || quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (!stockUnitPrice.trim()) {
      toast.error("Enter the unit price.");
      return;
    }
    setSavingStock(true);
    try {
      const created = await createStoreStock(token, myStore.id, {
        store_product_id: Number(stockProductId),
        quantity,
        transaction_type: stockType,
        unit_price: Number(stockUnitPrice),
        remarks: stockRemarks.trim() || undefined,
        transaction_date: new Date(stockDate).toISOString(),
      });
      setStoreStocks((list) => [created, ...list]);
      toast.success("Stock transaction logged");
      setStockFormOpen(false);
      refreshStoreProducts(); // current_stock lives on the product record
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not log this stock transaction."));
    } finally {
      setSavingStock(false);
    }
  };

  // --- POS: a cart against the store's own active products. No
  // Order/Invoice API exists yet, so "completing a sale" records each cart
  // line as its own `sale` stock transaction rather than one grouped
  // receipt — see completeSale below for how a partial failure is handled.

  const addToCart = (product: StoreProductRecord) => {
    setPosCart((cart) => {
      const existing = cart.find((c) => c.productId === product.id);
      if (existing) {
        return cart.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [
        ...cart,
        { productId: product.id, name: product.medicine_name ?? "Medicine", price: product.sale_price, qty: 1 },
      ];
    });
  };

  const updateCartQty = (productId: number, qty: number) => {
    setPosCart((cart) => {
      if (qty <= 0) return cart.filter((c) => c.productId !== productId);
      return cart.map((c) => (c.productId === productId ? { ...c, qty } : c));
    });
  };

  const removeFromCart = (productId: number) => {
    setPosCart((cart) => cart.filter((c) => c.productId !== productId));
  };

  const posTotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const completeSale = async () => {
    if (!token || !myStore || posCart.length === 0) return;
    setPosSubmitting(true);
    try {
      const order = await createOrder(token, myStore.id, {
        items: posCart.map((c) => ({ store_product_id: c.productId, quantity: c.qty })),
        customer_id: posCustomer?.id,
        payment_method: posPaymentMethod || undefined,
        discount: posDiscount.trim() ? Number(posDiscount) : undefined,
        delivery_fee: posDeliveryFee.trim() ? Number(posDeliveryFee) : undefined,
        notes: posNotes.trim() || undefined,
      });
      setLastOrder(order);
      setLastOrderCustomer(posCustomer);
      setPosCart([]);
      setPosDiscount("");
      setPosDeliveryFee("");
      setPosNotes("");
      clearPosCustomer();
      toast.success(`Order ${order.order_number} completed`);
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not complete this sale."));
    } finally {
      setPosSubmitting(false);
      refreshStoreProducts();
      refreshStoreOrders();
    }
  };

  const searchPosCustomer = async () => {
    if (!token) return;
    const phone = posCustomerPhone.trim();
    if (!phone) return;
    setPosCustomerLoading(true);
    setPosCustomerNotFound(false);
    const found = await findCustomerByPhone(token, phone);
    if (found) {
      setPosCustomer(found);
    } else {
      setPosCustomerNotFound(true);
    }
    setPosCustomerLoading(false);
  };

  const createPosCustomer = async () => {
    if (!token) return;
    const phone = posCustomerPhone.trim();
    if (!phone || !posNewCustomerName.trim()) {
      toast.error("Enter the customer's name.");
      return;
    }
    setPosCustomerCreating(true);
    try {
      const created = await createCustomerByPhone(token, phone, { name: posNewCustomerName.trim() });
      setPosCustomer(created);
      setPosCustomerNotFound(false);
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not add this customer."));
    } finally {
      setPosCustomerCreating(false);
    }
  };

  const clearPosCustomer = () => {
    setPosCustomer(null);
    setPosCustomerPhone("");
    setPosCustomerNotFound(false);
    setPosNewCustomerName("");
  };

  const refreshStoreOrders = async () => {
    if (!token || !myStore) return;
    setStoreOrdersLoading(true);
    const { orders, failed } = await fetchOrders(token, myStore.id);
    setStoreOrders(orders);
    setStoreOrdersFailed(failed);
    setStoreOrdersLoading(false);
  };

  const changeOrderStatus = async (order: OrderRecord, status: OrderStatus) => {
    if (!token || !myStore) return;
    setUpdatingOrderStatus(true);
    try {
      const updated = await updateOrderStatus(token, myStore.id, order.id, status);
      setStoreOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      setOrderDetailsView((current) => (current?.id === updated.id ? updated : current));
      toast.success("Order status updated");
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not update this order's status."));
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const printOrderFromHistory = (order: OrderRecord, mode: "80mm" | "a4") => {
    setLastOrder(order);
    // The order API only returns a bare customer_id here, no nested
    // name/address — that snapshot only exists for a sale just completed
    // live in POS, not one reopened from history, so clear any stale one.
    setLastOrderCustomer(null);
    setPrintInvoiceMode(mode);
    setOrderDetailsView(null);
  };

  // The just-created prescription has no directly-attached patient name —
  // fall back to the matching appointment's nested patient, if any.
  const patientLabelForPrescription = (rx: AppointmentPrescriptionRecord) => {
    const nestedPatient = (rx as MyPrescriptionRecord).patient;
    if (nestedPatient?.name?.trim()) return nestedPatient.name.trim();
    const apt = [...upcomingAppointments, ...allAppointments].find((a) => a.id === rx.appointment_id);
    return apt?.user_patient?.name?.trim() || `Patient #${rx.patient_user_id}`;
  };

  // The actual prescription layout — header, vitals, symptoms/diagnosis,
  // medicines table, notes. Shared between the hidden print-only area and a
  // normal on-screen card, so a doctor can see what was written up without
  // having to open the print dialog just to look at it.
  const renderPrescriptionDetails = (rx: AppointmentPrescriptionRecord) => {
    const nestedDoctor = (rx as MyPrescriptionRecord).doctor;
    // If the logged-in account is the one who wrote this prescription,
    // prefer their own live profile (title/specialization/reg. no.).
    // Otherwise — a patient (or a doctor wearing their patient hat)
    // viewing a prescription issued to them — use the doctor info the
    // record itself carries, falling back to the appointments list if it
    // doesn't (e.g. an older /appointment-prescriptions record with no
    // nested `doctor`).
    const selfIssued = isDoctor && rx.doctor_user_id === user?.id;
    const apt = [...upcomingAppointments, ...allAppointments].find((a) => a.id === rx.appointment_id);
    const doctorName = selfIssued
      ? user?.name?.trim() || ""
      : nestedDoctor?.name?.trim() || apt?.user_doctor?.name?.trim() || `Doctor #${rx.doctor_user_id}`;
    const doctorMeta = selfIssued
      ? [myDoctorRecord?.title, myDoctorRecord?.specialization].filter(Boolean).join(" · ")
      : "";
    const doctorReg = selfIssued ? myDoctorRecord?.license_number : undefined;

    return (
      <>
        <div className="flex items-start justify-between border-b-2 border-foreground pb-4">
          <div>
            <p className="text-lg font-bold">Dr. {doctorName}</p>
            {doctorMeta && <p className="text-sm">{doctorMeta}</p>}
            {doctorReg && <p className="text-xs">Reg. No: {doctorReg}</p>}
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold">Ibnocare</p>
            <p>
              {rx.prescription_date
                ? formatDateForDisplay(rx.prescription_date.slice(0, 10))
                : formatDateForDisplay(new Date().toISOString().slice(0, 10))}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p>
            <span className="font-semibold">Patient: </span>
            {patientLabelForPrescription(rx)}
          </p>
          <p className="text-xs capitalize">{rx.appointment_type?.toLowerCase()} visit</p>
        </div>

        {(rx.blood_pressure_systolic != null ||
          rx.blood_pressure_diastolic != null ||
          rx.pulse != null ||
          rx.sugar_level ||
          rx.is_smoking) && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-b border-dashed border-foreground/40 pb-3 text-xs">
            {(rx.blood_pressure_systolic != null || rx.blood_pressure_diastolic != null) && (
              <span>
                BP: {rx.blood_pressure_systolic ?? "—"}/{rx.blood_pressure_diastolic ?? "—"}
              </span>
            )}
            {rx.pulse != null && <span>Pulse: {rx.pulse}</span>}
            {rx.sugar_level && <span>Sugar: {rx.sugar_level}</span>}
            <span>Smoking: {rx.is_smoking ? "Yes" : "No"}</span>
          </div>
        )}

        {(rx.symptoms || rx.diagnosis) && (
          <div className="mt-3 space-y-1 border-b border-dashed border-foreground/40 pb-3 text-sm">
            {rx.symptoms && (
              <p>
                <span className="font-semibold">Symptoms: </span>
                {rx.symptoms}
              </p>
            )}
            {rx.diagnosis && (
              <p>
                <span className="font-semibold">Diagnosis: </span>
                {rx.diagnosis}
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
              {(rx.medicines ?? []).map((m, i) => (
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

        {rx.notes && (
          <p className="mt-4 text-sm">
            <span className="font-semibold">Notes: </span>
            {rx.notes}
          </p>
        )}
      </>
    );
  };

  const resetPrescriptionForm = () => {
    setRxBpSystolic("");
    setRxBpDiastolic("");
    setRxPulse("");
    setRxIsSmoking(false);
    setRxIsDiabetic(false);
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

  // Picking a result from the medicine search folds its strength straight
  // into the name — e.g. "Napa 500mg" — one field instead of a name box
  // plus a separate dose box the doctor would otherwise have to fill in too.
  const selectMedicineForRow = (index: number, medicine: PublicMedicineRecord) => {
    const name = medicine.weight ? `${medicine.name} ${medicine.weight}` : medicine.name;
    setRxMedicines((rows) => rows.map((row, i) => (i === index ? { ...row, name } : row)));
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

      // Reflect the write-up on the appointment itself — otherwise it keeps
      // showing as APPOINTED with a "Create Prescription" button as if
      // nothing happened, and a doctor could end up prescribing for the
      // same visit twice.
      try {
        await updateAppointment(token, rxAppointment.id, {
          user_doctor_id: rxAppointment.user_doctor_id,
          hospital_id: rxAppointment.hospital_id,
          chamber_id: rxAppointment.chamber_id,
          doctor_schedule_id: rxAppointment.doctor_schedule_id,
          fee: rxAppointment.fee != null ? Number(rxAppointment.fee) : undefined,
          discount: rxAppointment.discount != null ? Number(rxAppointment.discount) : undefined,
          appointment_type: rxAppointment.appointment_type,
          status: "PRESCRIBED",
          appointment_date: rxAppointment.appointment_date.slice(0, 10),
          appointment_time: rxAppointment.appointment_time ?? undefined,
        });
        // Patch only the status field — see the note in handleCancelAppointment
        // on why the PUT response itself isn't safe to spread wholesale here.
        const prescribedApptId = rxAppointment.id;
        const patch = (list: AppointmentRecord[]) =>
          list.map((a) => (a.id === prescribedApptId ? { ...a, status: "PRESCRIBED" } : a));
        setUpcomingAppointments(patch);
        setAllAppointments(patch);
        setMyAppointments(patch);
      } catch {
        // Non-fatal — the prescription itself saved fine; the appointment's
        // status just won't reflect it until the lists next refresh.
      }
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
        <div className="flex flex-wrap items-start justify-between gap-2">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      {selectedPatient && patientAppointments.length > 0 && (
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <CalendarDays className="size-4 text-muted-foreground" />
            Existing Appointments with {selectedPatient.name}
          </h3>
          <div className="mt-4 space-y-2">
            {[...patientAppointments]
              .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date))
              .map((apt) => {
                const status = effectiveAppointmentStatus(apt);
                const location = apt.chamber_name || apt.chamber?.name || apt.hospital_name || apt.hospital?.name;
                return (
                  <div
                    key={apt.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 border-l-4 p-3",
                      appointmentBorderStyles[status] ?? "border-l-border"
                    )}
                  >
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {formatDateForDisplay(apt.appointment_date.slice(0, 10))}
                        {apt.appointment_time && ` · ${formatTimeDisplay(apt.appointment_time)}`}
                        {status && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              appointmentStatusStyles[status] ?? "bg-secondary text-secondary-foreground"
                            )}
                          >
                            {status}
                          </span>
                        )}
                      </p>
                      {location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          {location}
                        </p>
                      )}
                    </div>
                    {status === "APPOINTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                        onClick={() => goToPrescriptionForFoundAppointment(apt)}
                      >
                        <FilePlus />
                        Create Prescription
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      )}

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
                  {chambers.length > 0 && <SelectItem value="CHAMBER">Chamber Visit</SelectItem>}
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
                              ? `${formatDateForDisplay(s.date.slice(0, 10))} · ${formatTimeDisplay(s.start_time)}–${formatTimeDisplay(s.end_time)}`
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
                              {formatDateForDisplay(s.date.slice(0, 10))} · {formatTimeDisplay(s.start_time)}–
                              {formatTimeDisplay(s.end_time)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="apptDate">Date</Label>
                <Input id="apptDate" type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apptTime">Time</Label>
                <Input id="apptTime" type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <section className={cn("px-4 py-4 text-foreground sm:px-6 lg:px-8", getRoleBannerClass(roles))}>
          <div className="mx-auto max-w-7xl">
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
                    <h1 className="text-xl font-bold text-foreground">
                      {isDoctor && "Dr. "}
                      {name}
                    </h1>
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="mt-3 flex flex-wrap gap-2">
              {isDoctor && myDoctorRecord?.specialization && (
                <div className="flex max-w-48 items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <Stethoscope className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{myDoctorRecord.specialization}</p>
                    <p className="text-[11px] text-muted-foreground">Specialty</p>
                  </div>
                </div>
              )}
              {isDoctor && myDoctorRecord?.license_number && (
                <div className="flex max-w-48 items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{myDoctorRecord.license_number}</p>
                    <p className="text-[11px] text-muted-foreground">License Number</p>
                  </div>
                </div>
              )}
              {user.bloodGroup && (
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <Droplet className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{user.bloodGroup}</p>
                    <p className="text-[11px] text-muted-foreground">Blood Group</p>
                  </div>
                </div>
              )}
              {user.gender && (
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <UserIcon className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground capitalize">{user.gender.toLowerCase()}</p>
                    <p className="text-[11px] text-muted-foreground">Gender</p>
                  </div>
                </div>
              )}
              {user.maritalStatus && (
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <Users className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground capitalize">
                      {user.maritalStatus.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Marital Status</p>
                  </div>
                </div>
              )}
              {age != null && user.dateOfBirth && (
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <Cake className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {age} yrs ·{" "}
                      {new Date(user.dateOfBirth).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Date of Birth</p>
                  </div>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <CalendarDays className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Member Since</p>
                  </div>
                </div>
              )}
              {user.address && (
                <div className="flex max-w-56 items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5">
                  <MapPin className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{user.address}</p>
                    <p className="text-[11px] text-muted-foreground">Address</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Compact quick-links row */}
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3">
            {!isDoctor && (
              <Link href="/dashboard/become-a-doctor" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Stethoscope />
                Become a Doctor
              </Link>
            )}
            {!hasAmbulance && (
              <button
                type="button"
                onClick={() => handleTabChange("ambulances")}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Ambulance />
                Register an Ambulance
              </button>
            )}
            {!isBloodDonor && (
              <button
                type="button"
                onClick={() => handleTabChange("blood-donor")}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Droplet />
                Become a Blood Donor
              </button>
            )}
            {!hasStore && (
              <button
                type="button"
                onClick={() => handleTabChange("store")}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Store />
                Register a Store
              </button>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Main content — switches per selected tab */}
            <div className="order-2 min-w-0">
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
                      <div className="flex flex-wrap items-start justify-between gap-2">
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

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Tabs
                          value={appointmentsView}
                          onValueChange={(v) => setAppointmentsView(v as "upcoming" | "all")}
                        >
                          <TabsList>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <div className="relative sm:w-64">
                          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={appointmentSearch}
                            onChange={(e) => setAppointmentSearch(e.target.value)}
                            placeholder={isDoctor ? "Search patient by name or phone…" : "Search doctor by name…"}
                            className="h-9 pl-8"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-5">
                        {(isDoctor ? appointmentsLoading : myAppointmentsLoading) ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : (
                          (() => {
                            // Doctors see their practice-side list here (patients
                            // booked with them) from /appointments[/upcoming].
                            // Pure patients use /my-appointments instead — the
                            // dedicated "appointments where I'm the patient"
                            // endpoint, which is what actually has their data
                            // (the /appointments endpoints returned empty for a
                            // patient token in testing).
                            const today = new Date().toISOString().slice(0, 10);
                            const source = isDoctor
                              ? appointmentsView === "upcoming"
                                ? upcomingAppointments
                                : allAppointments
                              : appointmentsView === "upcoming"
                                ? myAppointments.filter((apt) => apt.appointment_date.slice(0, 10) >= today)
                                : myAppointments;
                            const query = appointmentSearch.trim().toLowerCase();
                            const filtered = query
                              ? source.filter((apt) => {
                                  const counterpart = isDoctor ? apt.user_patient : apt.user_doctor;
                                  return (
                                    counterpart?.name?.toLowerCase().includes(query) ||
                                    counterpart?.phone?.toLowerCase().includes(query)
                                  );
                                })
                              : source;
                            if (filtered.length === 0) {
                              return (
                                <div className="flex flex-col items-center gap-2 py-10 text-center">
                                  <CalendarDays className="size-6 text-muted-foreground/60" />
                                  <p className="text-sm text-muted-foreground">
                                    {query
                                      ? "No appointments match your search."
                                      : `No ${appointmentsView} appointments.`}
                                  </p>
                                </div>
                              );
                            }
                            return groupAppointmentsByDate(filtered).map((group) => (
                              <div key={group.key}>
                                <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                  {group.label}
                                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground normal-case">
                                    {group.items.length}
                                  </span>
                                </p>
                                <div className="space-y-2">
                                  {group.items.map((apt) => {
                                    const counterpart = isDoctor ? apt.user_patient : apt.user_doctor;
                                    const counterpartName =
                                      counterpart?.name?.trim() ||
                                      (isDoctor ? `Patient #${apt.user_patient_id}` : `Doctor #${apt.user_doctor_id}`);
                                    const location =
                                      apt.chamber_name || apt.chamber?.name || apt.hospital_name || apt.hospital?.name;
                                    const status = effectiveAppointmentStatus(apt);
                                    const canPrescribe = status === "APPOINTED";
                                    return (
                                      <div
                                        key={apt.id}
                                        className={cn(
                                          "rounded-xl border border-border/60 border-l-4 p-4 transition-colors hover:bg-secondary/30",
                                          appointmentBorderStyles[status] ?? "border-l-border"
                                        )}
                                      >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="flex items-start gap-3">
                                            <UserAvatar
                                              name={counterpartName}
                                              imageUrl={counterpart?.profile_image}
                                              gender={counterpart?.gender}
                                              className="size-10 shrink-0"
                                            />
                                            <div>
                                              <p className="flex items-center gap-2 font-semibold text-foreground">
                                                {!isDoctor && "Dr. "}
                                                {counterpartName}
                                                {status && (
                                                  <span
                                                    className={cn(
                                                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                      appointmentStatusStyles[status] ??
                                                        "bg-secondary text-secondary-foreground"
                                                    )}
                                                  >
                                                    {status}
                                                  </span>
                                                )}
                                              </p>
                                              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                                {counterpart?.phone && <span>{counterpart.phone}</span>}
                                                {isDoctor && counterpart?.blood_group && (
                                                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                                    {counterpart.blood_group}
                                                  </span>
                                                )}
                                                {location && (
                                                  <span className="flex items-center gap-1">
                                                    <MapPin className="size-3 shrink-0" />
                                                    {location}
                                                  </span>
                                                )}
                                                <span className="capitalize">{apt.appointment_type?.toLowerCase()}</span>
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground sm:text-right">
                                            <Clock className="size-3.5 text-muted-foreground" />
                                            {apt.appointment_time ? formatTimeDisplay(apt.appointment_time) : "—"}
                                          </div>
                                        </div>
                                        {(apt.fee != null || apt.discount != null || isDoctor) && (
                                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                                            <p className="text-xs text-muted-foreground">
                                              {apt.fee != null && `Fee ৳${apt.fee}`}
                                              {apt.discount != null && ` · Discount ৳${apt.discount}`}
                                            </p>
                                            {isDoctor && canPrescribe && (
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                                  onClick={() => goToAppointmentPrescription(apt.id)}
                                                >
                                                  <FilePlus />
                                                  Create Prescription
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  disabled={updatingAppointmentStatusId === apt.id}
                                                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                                                  onClick={() => handleCancelAppointment(apt)}
                                                >
                                                  <X />
                                                  Cancel
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "my-appointments" && isDoctor && (
                  <motion.div
                    key="my-appointments"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Card className="border-border/60 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <CalendarDays className="size-4 text-primary" />
                            My Appointments
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Visits you&apos;ve booked with other doctors, as a patient.
                          </p>
                        </div>
                        <Button size="sm" render={<Link href="/doctors" />} nativeButton={false}>
                          <CalendarPlus />
                          Book a New Appointment
                        </Button>
                      </div>

                      <div className="mt-4 space-y-5">
                        {myAppointmentsLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : (
                          (() => {
                            const mine = [...myAppointments].sort((a, b) =>
                              a.appointment_date.localeCompare(b.appointment_date)
                            );
                            if (mine.length === 0) {
                              return (
                                <div className="flex flex-col items-center gap-2 py-10 text-center">
                                  <CalendarDays className="size-6 text-muted-foreground/60" />
                                  <p className="text-sm text-muted-foreground">
                                    You haven&apos;t booked any appointments with other doctors yet.
                                  </p>
                                </div>
                              );
                            }
                            return groupAppointmentsByDate(mine).map((group) => (
                              <div key={group.key}>
                                <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                  {group.label}
                                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground normal-case">
                                    {group.items.length}
                                  </span>
                                </p>
                                <div className="space-y-2">
                                  {group.items.map((apt) => {
                                    const doctor = apt.user_doctor;
                                    const doctorName = doctor?.name?.trim() || `Doctor #${apt.user_doctor_id}`;
                                    const location =
                                      apt.chamber_name || apt.chamber?.name || apt.hospital_name || apt.hospital?.name;
                                    const status = effectiveAppointmentStatus(apt);
                                    const rx = myPrescriptions.find((p) => p.appointment_id === apt.id);
                                    return (
                                      <div
                                        key={apt.id}
                                        className={cn(
                                          "rounded-xl border border-border/60 border-l-4 p-4 transition-colors hover:bg-secondary/30",
                                          appointmentBorderStyles[status] ?? "border-l-border"
                                        )}
                                      >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="flex items-start gap-3">
                                            <UserAvatar
                                              name={doctorName}
                                              imageUrl={doctor?.profile_image}
                                              gender={doctor?.gender}
                                              className="size-10 shrink-0"
                                            />
                                            <div>
                                              <p className="flex items-center gap-2 font-semibold text-foreground">
                                                Dr. {doctorName}
                                                {status && (
                                                  <span
                                                    className={cn(
                                                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                      appointmentStatusStyles[status] ??
                                                        "bg-secondary text-secondary-foreground"
                                                    )}
                                                  >
                                                    {status}
                                                  </span>
                                                )}
                                              </p>
                                              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                                {location && (
                                                  <span className="flex items-center gap-1">
                                                    <MapPin className="size-3 shrink-0" />
                                                    {location}
                                                  </span>
                                                )}
                                                <span className="capitalize">{apt.appointment_type?.toLowerCase()}</span>
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground sm:text-right">
                                            <Clock className="size-3.5 text-muted-foreground" />
                                            {apt.appointment_time ? formatTimeDisplay(apt.appointment_time) : "—"}
                                          </div>
                                        </div>
                                        {rx && (
                                          <div className="mt-3 flex justify-end gap-2 border-t border-border/40 pt-3">
                                            <Button variant="outline" size="sm" onClick={() => setPrescriptionDetailsView(rx)}>
                                              <Eye />
                                              View Details
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setViewingPrescription(rx)}>
                                              <Printer />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "my-prescriptions" && isDoctor && (
                  <motion.div
                    key="my-prescriptions"
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
                        Prescriptions issued to you by doctors you&apos;ve consulted.
                      </p>

                      <div className="mt-4 space-y-3">
                        {myPrescriptionsLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : myPrescriptions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No prescriptions yet.</p>
                        ) : (
                          myPrescriptions.map((rx) => {
                            const doctorName = rx.doctor?.name?.trim() || `Dr. #${rx.doctor_user_id}`;
                            const location = rx.chamber?.name || rx.appointment?.chamber_name;
                            return (
                              <div key={rx.id} className="rounded-xl border border-border/60 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex flex-1 items-center gap-3">
                                    <UserAvatar
                                      name={doctorName}
                                      imageUrl={rx.doctor?.profile_image}
                                      gender={rx.doctor?.gender}
                                      className="size-10 shrink-0"
                                    />
                                    <div>
                                      <p className="font-semibold text-foreground">Dr. {doctorName}</p>
                                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                        {rx.prescription_date
                                          ? formatDateForDisplay(rx.prescription_date.slice(0, 10))
                                          : "—"}
                                        {" · "}
                                        {(rx.medicines ?? []).length} medicine
                                        {(rx.medicines ?? []).length === 1 ? "" : "s"}
                                        {location && (
                                          <span className="flex items-center gap-1">
                                            <MapPin className="size-3 shrink-0" />
                                            {location}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPrescriptionDetailsView(rx)}>
                                      <Eye />
                                      View Details
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setViewingPrescription(rx)}>
                                      <Printer />
                                      Print
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
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
                        {myPrescriptionsLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : myPrescriptions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No prescriptions yet.</p>
                        ) : (
                          myPrescriptions.map((rx) => {
                            const doctorName = rx.doctor?.name?.trim() || `Dr. #${rx.doctor_user_id}`;
                            return (
                              <div key={rx.id} className="rounded-xl border border-border/60 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex flex-1 items-center gap-3">
                                    <UserAvatar
                                      name={doctorName}
                                      imageUrl={rx.doctor?.profile_image}
                                      gender={rx.doctor?.gender}
                                      className="size-10 shrink-0"
                                    />
                                    <div>
                                      <p className="font-semibold text-foreground">Dr. {doctorName}</p>
                                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                        <CalendarDays className="size-3.5" />
                                        {rx.prescription_date
                                          ? formatDateForDisplay(rx.prescription_date.slice(0, 10))
                                          : "—"}
                                        {(rx.chamber?.name || rx.appointment?.chamber_name) && (
                                          <span className="flex items-center gap-1">
                                            <MapPin className="size-3 shrink-0" />
                                            {rx.chamber?.name || rx.appointment?.chamber_name}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPrescriptionDetailsView(rx)}>
                                      <Eye />
                                      View Details
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setViewingPrescription(rx)}>
                                      <Printer />
                                      Print
                                    </Button>
                                  </div>
                                </div>
                                <p className="mt-3 truncate text-sm text-muted-foreground">
                                  {(rx.medicines ?? []).map((m) => m.name).join(", ") || "No medicines listed."}
                                </p>
                              </div>
                            );
                          })
                        )}
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

                {activeTab === "posts" && isPatient && (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Card className="border-border/60 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <MessageCircle className="size-4 text-primary" />
                            My Posts
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Share a problem, a solution, or a health tip with the community.
                          </p>
                        </div>
                        {!newPostOpen && (
                          <Button size="sm" onClick={openNewPost}>
                            <Plus />
                            New Post
                          </Button>
                        )}
                      </div>

                      {newPostOpen && (
                        <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border/60 p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="newPostTitle">Title</Label>
                            <Input
                              id="newPostTitle"
                              value={newPostTitle}
                              onChange={(e) => setNewPostTitle(e.target.value)}
                              placeholder="A short, descriptive title"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="newPostBody">Write your post</Label>
                            <RichTextEditor
                              id="newPostBody"
                              value={newPostBody}
                              onValueChange={setNewPostBody}
                              placeholder="Describe the problem, share what worked, or give a health tip..."
                            />
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewPostOpen(false);
                                setNewPostTitle("");
                                setNewPostBody("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button variant="outline" size="sm" onClick={saveDraft}>
                              Save Draft
                            </Button>
                            <Button size="sm" onClick={createPostSubmit} disabled={savingPost}>
                              {savingPost ? "Publishing..." : "Publish"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {!newPostOpen && (
                        <div className="mt-5 space-y-2">
                          {myPostsLoading ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                          ) : myPosts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">You haven&apos;t posted anything yet.</p>
                          ) : (
                            myPosts.map((post) => {
                              const comments = post.comments ?? [];
                              const ratings = post.ratings ?? [];
                              const avgRating = ratings.length
                                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                                : null;
                              const expanded = expandedPostId === post.id;
                              return (
                                <div key={post.id} className="rounded-xl border border-border/60 p-3">
                                  <button
                                    type="button"
                                    className="w-full text-left"
                                    onClick={() => setExpandedPostId((id) => (id === post.id ? null : post.id))}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span
                                        className={cn(
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                          post.type === "DOCTOR_POST"
                                            ? "bg-primary/10 text-primary"
                                            : "bg-secondary text-secondary-foreground"
                                        )}
                                      >
                                        {POST_TYPE_LABELS[post.type as PostType] ?? "Discussion"}
                                      </span>
                                      {post.created_at && (
                                        <span className="text-xs text-muted-foreground">
                                          {formatDateForDisplay(post.created_at.slice(0, 10))}
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1.5 truncate text-sm font-medium text-foreground">
                                      {post.title?.trim() || "Untitled post"}
                                    </p>
                                    {post.body && (
                                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                        {stripHtmlToText(post.body)}
                                      </p>
                                    )}
                                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <MessageCircle className="size-3.5" />
                                        {comments.length} comment{comments.length === 1 ? "" : "s"}
                                      </span>
                                      {avgRating != null && (
                                        <span className="flex items-center gap-1">
                                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                          {avgRating.toFixed(1)} ({ratings.length})
                                        </span>
                                      )}
                                      <ChevronDown
                                        className={cn("ml-auto size-4 transition-transform", expanded && "rotate-180")}
                                      />
                                    </div>
                                  </button>

                                  {expanded && (
                                    <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
                                      {ratings.length > 0 && (
                                        <div className="space-y-1.5">
                                          <p className="text-xs font-semibold text-foreground">Ratings</p>
                                          {ratings.map((r) => (
                                            <div key={r.id} className="rounded-lg bg-secondary/40 p-2 text-xs">
                                              <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={cn(
                                                      "size-3",
                                                      i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"
                                                    )}
                                                  />
                                                ))}
                                              </div>
                                              {r.review && <p className="mt-1 text-muted-foreground">{r.review}</p>}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-foreground">Comments</p>
                                        {comments.length === 0 ? (
                                          <p className="text-xs text-muted-foreground">No comments yet.</p>
                                        ) : (
                                          comments.map((c) => (
                                            <div key={c.id} className="rounded-lg bg-secondary/40 p-2 text-xs">
                                              <p className="font-medium text-foreground">
                                                {displayNameWithTitle(
                                                  c.user?.name?.trim() || `User #${c.user_id}`,
                                                  c.user?.type
                                                )}
                                              </p>
                                              <p className="mt-0.5 text-muted-foreground">{c.body}</p>
                                              {(c.replies ?? []).map((reply) => (
                                                <div key={reply.id} className="mt-2 ml-4 border-l-2 border-border/60 pl-2">
                                                  <p className="font-medium text-foreground">
                                                    {displayNameWithTitle(
                                                      reply.user?.name?.trim() || `User #${reply.user_id}`,
                                                      reply.user?.type
                                                    )}
                                                  </p>
                                                  <p className="mt-0.5 text-muted-foreground">{reply.body}</p>
                                                </div>
                                              ))}
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      <Link
                                        href={`/community/${post.id}`}
                                        className="inline-flex text-xs font-medium text-primary hover:underline"
                                      >
                                        View full post & reply →
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {activeTab === "blood-donor" && isPatient && (
                  <motion.div
                    key="blood-donor"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <Droplet className="size-4 text-primary" />
                        Blood Donor Status
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Opt in to be listed as an available blood donor.
                      </p>

                      {!user.bloodGroup ? (
                        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-dashed border-border/60 p-4 sm:flex-row sm:items-end">
                          <div className="flex-1 space-y-1.5">
                            <Label>Blood Group</Label>
                            <p className="text-xs text-muted-foreground">
                              Set your blood group before you can register as a donor.
                            </p>
                            <Select value={donorBloodGroup} onValueChange={(v) => setDonorBloodGroup(v ?? "")}>
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
                          <Button size="sm" onClick={saveDonorBloodGroup} disabled={savingDonorBloodGroup}>
                            {savingDonorBloodGroup ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {donorInterestLoading
                                ? "Checking your status…"
                                : isBloodDonor
                                  ? "You're listed as an available donor"
                                  : "Not currently listed as a donor"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Blood group on file: {user.bloodGroup}
                            </p>
                          </div>
                          <Switch
                            checked={isBloodDonor}
                            disabled={donorInterestLoading || updatingDonorInterest}
                            onCheckedChange={toggleDonorInterest}
                          />
                        </div>
                      )}
                    </Card>

                    <Card className="border-border/60 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <Droplet className="size-4 text-primary" />
                            Log a Donation
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Record a donation you gave to a patient.
                          </p>
                        </div>
                        {!logDonationOpen && (
                          <Button size="sm" onClick={() => setLogDonationOpen(true)}>
                            <Plus />
                            Log a Donation
                          </Button>
                        )}
                      </div>

                      {logDonationOpen && (
                        <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border/60 p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="donationPatientName">Patient Name</Label>
                            <Input
                              id="donationPatientName"
                              value={donationPatientName}
                              onChange={(e) => setDonationPatientName(e.target.value)}
                              placeholder="Who received this donation"
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label>Patient Gender</Label>
                              <Select
                                value={donationPatientGender}
                                onValueChange={(v) => setDonationPatientGender((v as DonationPatientGender) ?? "")}
                              >
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
                              <Label>Patient Blood Group</Label>
                              <Select
                                value={donationPatientBloodGroup}
                                onValueChange={(v) => setDonationPatientBloodGroup(v ?? "")}
                              >
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
                            <Label htmlFor="donationPatientDisease">Patient Condition (optional)</Label>
                            <Input
                              id="donationPatientDisease"
                              value={donationPatientDisease}
                              onChange={(e) => setDonationPatientDisease(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="donationDate">Donation Date</Label>
                              <Input
                                id="donationDate"
                                type="date"
                                value={donationDate}
                                onChange={(e) => setDonationDate(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="donationUnits">Units</Label>
                              <Input
                                id="donationUnits"
                                type="number"
                                min={1}
                                value={donationUnits}
                                onChange={(e) => setDonationUnits(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="donationHospitalName">Hospital Name (optional)</Label>
                              <Input
                                id="donationHospitalName"
                                value={donationHospitalName}
                                onChange={(e) => setDonationHospitalName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="donationHospitalAddress">Hospital Address (optional)</Label>
                              <Input
                                id="donationHospitalAddress"
                                value={donationHospitalAddress}
                                onChange={(e) => setDonationHospitalAddress(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="donationNotes">Notes (optional)</Label>
                            <Textarea
                              id="donationNotes"
                              rows={2}
                              value={donationNotes}
                              onChange={(e) => setDonationNotes(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setLogDonationOpen(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={submitDonation} disabled={savingDonation}>
                              {savingDonation ? "Saving..." : "Log Donation"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>

                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <Droplet className="size-4 text-primary" />
                        My Donations
                      </h3>

                      <div className="mt-4 space-y-2">
                        {myDonationsLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : myDonations.length === 0 ? (
                          <p className="text-sm text-muted-foreground">You haven&apos;t logged any donations yet.</p>
                        ) : (
                          myDonations.map((d) => (
                            <div
                              key={d.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
                            >
                              <div>
                                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                  {d.patient_name}
                                  {d.patient_blood_group && (
                                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                      {d.patient_blood_group}
                                    </span>
                                  )}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {d.donation_date ? formatDateForDisplay(d.donation_date.slice(0, 10)) : "—"}
                                  {d.hospital_name && ` · ${d.hospital_name}`}
                                  {" · "}
                                  {d.units} unit{d.units === 1 ? "" : "s"}
                                </p>
                                {d.notes && <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{d.notes}&rdquo;</p>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "ambulances" && isPatient && (
                  <motion.div
                    key="ambulances"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/60 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <Ambulance className="size-4 text-primary" />
                            My Ambulances
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Register and manage the ambulance vehicles you own — add as many as you like.
                          </p>
                        </div>
                        {ambulanceFormOpen === null && (
                          <Button size="sm" onClick={openNewAmbulanceForm}>
                            <Plus />
                            Add Ambulance
                          </Button>
                        )}
                      </div>

                      {ambulanceFormOpen === null ? (
                        <div className="mt-5 space-y-3">
                          {myAmbulancesLoading ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                          ) : myAmbulances.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                              No ambulances registered yet. Add your first one to get started.
                            </p>
                          ) : (
                            myAmbulances.map((a) => (
                              <div key={a.id} className="rounded-xl border border-border/60 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                                      {a.brand_model || "Ambulance"}
                                      {a.ambulance_type && (
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                          {AMBULANCE_TYPE_OPTIONS.find((t) => t.value === a.ambulance_type)?.label ??
                                            a.ambulance_type}
                                        </span>
                                      )}
                                      <span
                                        className={cn(
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                          a.is_active
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
                                        )}
                                      >
                                        {a.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                      {a.license_plate_number} · {a.phone_number}
                                    </p>
                                    {a.address && (
                                      <p className="mt-0.5 text-xs text-muted-foreground">{a.address}</p>
                                    )}
                                    {a.equipment_list && a.equipment_list.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {a.equipment_list.map((eq) => (
                                          <span
                                            key={eq}
                                            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                                          >
                                            {eq}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {a.description && (
                                      <p className="mt-2 text-xs text-muted-foreground">{a.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {confirmDeleteAmbulanceId === a.id ? (
                                      <>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeAmbulance(a.id)}
                                          disabled={deletingAmbulanceId === a.id}
                                        >
                                          {deletingAmbulanceId === a.id ? "Removing..." : "Confirm Remove"}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setConfirmDeleteAmbulanceId(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="icon-sm"
                                          onClick={() => openEditAmbulanceForm(a)}
                                          aria-label="Edit ambulance"
                                        >
                                          <Pencil />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          className="text-muted-foreground hover:text-destructive"
                                          onClick={() => setConfirmDeleteAmbulanceId(a.id)}
                                          aria-label="Remove ambulance"
                                        >
                                          <Trash2 />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      ) : (
                        <div className="mt-5 space-y-4 rounded-xl border border-dashed border-border/60 p-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="ambulanceBrandModel">Brand / Model</Label>
                              <Input
                                id="ambulanceBrandModel"
                                value={ambulanceBrandModel}
                                onChange={(e) => setAmbulanceBrandModel(e.target.value)}
                                placeholder="e.g. Toyota Hiace"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Ambulance Type</Label>
                              <Select
                                value={ambulanceType}
                                onValueChange={(v) => setAmbulanceType((v as AmbulanceType) ?? "")}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select">
                                    {(value: AmbulanceType) =>
                                      AMBULANCE_TYPE_OPTIONS.find((t) => t.value === value)?.label ?? "Select"
                                    }
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {AMBULANCE_TYPE_OPTIONS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="ambulanceLicensePlate">License Plate Number</Label>
                              <Input
                                id="ambulanceLicensePlate"
                                value={ambulanceLicensePlate}
                                onChange={(e) => setAmbulanceLicensePlate(e.target.value)}
                                placeholder="e.g. DHK-METRO-GA-11-2201"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="ambulancePhone">Contact Phone</Label>
                              <Input
                                id="ambulancePhone"
                                value={ambulancePhone}
                                onChange={(e) => setAmbulancePhone(e.target.value)}
                                placeholder="e.g. 01712340011"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="ambulanceAddress">Address (optional)</Label>
                            <Input
                              id="ambulanceAddress"
                              value={ambulanceAddress}
                              onChange={(e) => setAmbulanceAddress(e.target.value)}
                              placeholder="Where this ambulance is based"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Equipment</Label>
                            <TagInput
                              value={ambulanceEquipment}
                              onChange={setAmbulanceEquipment}
                              placeholder="e.g. Oxygen Supply"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="ambulanceDescription">Description (optional)</Label>
                            <Textarea
                              id="ambulanceDescription"
                              rows={2}
                              value={ambulanceDescription}
                              onChange={(e) => setAmbulanceDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
                            <Label htmlFor="ambulanceIsActive" className="cursor-pointer">
                              Available for requests
                            </Label>
                            <Switch
                              id="ambulanceIsActive"
                              checked={ambulanceIsActive}
                              onCheckedChange={setAmbulanceIsActive}
                            />
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setAmbulanceFormOpen(null)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveAmbulance} disabled={savingAmbulance}>
                              {savingAmbulance
                                ? "Saving..."
                                : typeof ambulanceFormOpen === "number"
                                  ? "Update Ambulance"
                                  : "Add Ambulance"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {(activeTab === "store" || activeTab === "store-products" || activeTab === "store-stock") &&
                  isPatient && (
                  <motion.div
                    key="store"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {activeTab === "store" && (
                    <Card className="border-border/60 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <Store className="size-4 text-primary" />
                            {myStore ? myStore.store_name : "My Store"}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {myStore
                              ? "Your registered medical store."
                              : "Register a store to start adding medicines and tracking stock."}
                          </p>
                        </div>
                        {myStore && !storeFormOpen && (
                          <Button size="sm" variant="outline" onClick={openEditStoreForm}>
                            <Pencil />
                            Edit
                          </Button>
                        )}
                      </div>

                      {myStoreLoading ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                      ) : !myStore && !storeFormOpen ? (
                        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 p-8 text-center">
                          <Store className="size-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">You haven&apos;t registered a store yet.</p>
                          <Button size="sm" onClick={openCreateStoreForm}>
                            <Plus />
                            Register a Store
                          </Button>
                        </div>
                      ) : storeFormOpen ? (
                        <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border/60 p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="storeAddress">Address</Label>
                            <Input
                              id="storeAddress"
                              value={storeAddress}
                              onChange={(e) => setStoreAddress(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="storeLicense">Trade License Number</Label>
                              <Input
                                id="storeLicense"
                                value={storeLicense}
                                onChange={(e) => setStoreLicense(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="storePhone">Phone</Label>
                              <Input id="storePhone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="storeEmail">Email</Label>
                            <Input
                              id="storeEmail"
                              type="email"
                              value={storeEmail}
                              onChange={(e) => setStoreEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="storeDescription">Description</Label>
                            <Textarea
                              id="storeDescription"
                              rows={2}
                              value={storeDescription}
                              onChange={(e) => setStoreDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setStoreFormOpen(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveStore} disabled={savingStore}>
                              {savingStore ? "Saving..." : myStore ? "Save Changes" : "Register Store"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        myStore && (
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Address</p>
                              <p className="text-sm text-foreground">{myStore.store_address}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Trade License</p>
                              <p className="text-sm text-foreground">{myStore.trade_license_no}</p>
                            </div>
                            {myStore.phone && (
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm text-foreground">{myStore.phone}</p>
                              </div>
                            )}
                            {myStore.email && (
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm text-foreground">{myStore.email}</p>
                              </div>
                            )}
                            {myStore.description && (
                              <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">Description</p>
                                <p className="text-sm text-foreground">{myStore.description}</p>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </Card>
                    )}

                    {activeTab === "store-products" && !myStore && (
                      <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
                        <Store className="size-8 text-muted-foreground" />
                        <p className="font-semibold text-foreground">No store yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                          Register a store from the Shop tab before adding products.
                        </p>
                        <Button size="sm" onClick={() => handleTabChange("store")}>
                          Go to Shop
                        </Button>
                      </Card>
                    )}

                    {activeTab === "store-products" && myStore && (
                      <Card className="border-border/60 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                              <Pill className="size-4 text-primary" />
                              Products
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">Medicines you sell at this store.</p>
                          </div>
                          {productFormOpen === null && (
                            <Button size="sm" onClick={openNewProductForm}>
                              <Plus />
                              Add Product
                            </Button>
                          )}
                        </div>

                        {productFormOpen === null ? (
                          <div className="mt-5 space-y-3">
                            {storeProductsLoading ? (
                              <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                            ) : storeProducts.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                                No products yet. Add your first medicine to start tracking stock.
                              </p>
                            ) : (
                              storeProducts.map((p) => (
                                <div key={p.id} className="rounded-xl border border-border/60 p-4">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                                        {p.medicine_name ?? `Medicine #${p.medicine_id}`}
                                        <span
                                          className={cn(
                                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                            p.is_active
                                              ? "bg-primary/10 text-primary"
                                              : "bg-muted text-muted-foreground"
                                          )}
                                        >
                                          {p.is_active ? "Active" : "Inactive"}
                                        </span>
                                        {p.minimum_stock != null && (p.current_stock ?? 0) <= p.minimum_stock && (
                                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                                            Low stock
                                          </span>
                                        )}
                                      </p>
                                      {p.medicine_generic_name && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                          {p.medicine_generic_name}
                                        </p>
                                      )}
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        Buy ৳{p.buy_price} · Sale ৳{p.sale_price} · Wholesale ৳{p.wholesale_price}
                                      </p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        In stock: {p.current_stock ?? 0}
                                        {p.minimum_stock != null && ` · Min ${p.minimum_stock}`}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {confirmDeleteProductId === p.id ? (
                                        <>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeProduct(p.id)}
                                            disabled={deletingProductId === p.id}
                                          >
                                            {deletingProductId === p.id ? "Removing..." : "Confirm Remove"}
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setConfirmDeleteProductId(null)}
                                          >
                                            Cancel
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() => openEditProductForm(p)}
                                            aria-label="Edit product"
                                          >
                                            <Pencil />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => setConfirmDeleteProductId(p.id)}
                                            aria-label="Remove product"
                                          >
                                            <Trash2 />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border/60 p-4">
                            <div className="space-y-1.5">
                              <Label>Medicine</Label>
                              <MedicineSearchInput
                                value={productMedicineQuery}
                                onValueChange={setProductMedicineQuery}
                                onSelectMedicine={(m) => {
                                  setProductMedicineId(m.id);
                                  setProductMedicineQuery(m.weight ? `${m.name} ${m.weight}` : m.name);
                                  // Convenience default, not a source of truth — only fills an
                                  // empty field so it never clobbers a price already typed in
                                  // (e.g. while editing an existing product).
                                  if (!productBuyPrice && m.suggestion_price != null) {
                                    setProductBuyPrice(String(m.suggestion_price));
                                  }
                                }}
                                placeholder="Search medicine by name…"
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="productBuyPrice">Buy Price (৳)</Label>
                                <Input
                                  id="productBuyPrice"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={productBuyPrice}
                                  onChange={(e) => setProductBuyPrice(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="productSalePrice">Sale Price (৳)</Label>
                                <Input
                                  id="productSalePrice"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={productSalePrice}
                                  onChange={(e) => setProductSalePrice(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="productWholesalePrice">Wholesale Price (৳)</Label>
                                <Input
                                  id="productWholesalePrice"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={productWholesalePrice}
                                  onChange={(e) => setProductWholesalePrice(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="productMinStock">Minimum Stock (optional)</Label>
                              <Input
                                id="productMinStock"
                                type="number"
                                min={0}
                                value={productMinStock}
                                onChange={(e) => setProductMinStock(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
                              <Label htmlFor="productIsActive" className="cursor-pointer">
                                Available for sale
                              </Label>
                              <Switch
                                id="productIsActive"
                                checked={productIsActive}
                                onCheckedChange={setProductIsActive}
                              />
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setProductFormOpen(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={saveProduct} disabled={savingProduct}>
                                {savingProduct
                                  ? "Saving..."
                                  : typeof productFormOpen === "number"
                                    ? "Update Product"
                                    : "Add Product"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    )}

                    {activeTab === "store-stock" && !myStore && (
                      <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
                        <Store className="size-8 text-muted-foreground" />
                        <p className="font-semibold text-foreground">No store yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                          Register a store from the Shop tab before logging stock.
                        </p>
                        <Button size="sm" onClick={() => handleTabChange("store")}>
                          Go to Shop
                        </Button>
                      </Card>
                    )}

                    {activeTab === "store-stock" && myStore && storeProducts.length === 0 && (
                      <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
                        <Pill className="size-8 text-muted-foreground" />
                        <p className="font-semibold text-foreground">No products yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                          Add a product from the Products tab before logging stock.
                        </p>
                        <Button size="sm" onClick={() => handleTabChange("store-products")}>
                          Go to Products
                        </Button>
                      </Card>
                    )}

                    {activeTab === "store-stock" && myStore && storeProducts.length > 0 && (
                      <Card className="border-border/60 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                              <Receipt className="size-4 text-primary" />
                              Stock Ledger
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Log purchases, sales, returns, and adjustments.
                            </p>
                          </div>
                          {!stockFormOpen && (
                            <Button size="sm" onClick={openStockForm}>
                              <Plus />
                              Log Stock
                            </Button>
                          )}
                        </div>

                        {stockFormOpen && (
                          <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border/60 p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label>Product</Label>
                                <Select value={stockProductId} onValueChange={(v) => setStockProductId(v ?? "")}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select">
                                      {(value: string) =>
                                        storeProducts.find((p) => String(p.id) === value)?.medicine_name ??
                                        "Select"
                                      }
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {storeProducts.map((p) => (
                                      <SelectItem key={p.id} value={String(p.id)}>
                                        {p.medicine_name ?? `Medicine #${p.medicine_id}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label>Transaction Type</Label>
                                <Select
                                  value={stockType}
                                  onValueChange={(v) => setStockType((v as StockTransactionType) ?? "purchase")}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue>
                                      {(value: StockTransactionType) =>
                                        STOCK_TRANSACTION_TYPES.find((t) => t.value === value)?.label ?? value
                                      }
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STOCK_TRANSACTION_TYPES.map((t) => (
                                      <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="stockQuantity">Quantity</Label>
                                <Input
                                  id="stockQuantity"
                                  type="number"
                                  min={1}
                                  value={stockQuantity}
                                  onChange={(e) => setStockQuantity(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="stockUnitPrice">Unit Price (৳)</Label>
                                <Input
                                  id="stockUnitPrice"
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={stockUnitPrice}
                                  onChange={(e) => setStockUnitPrice(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="stockDate">Date</Label>
                                <Input
                                  id="stockDate"
                                  type="date"
                                  value={stockDate}
                                  onChange={(e) => setStockDate(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="stockRemarks">Remarks (optional)</Label>
                              <Textarea
                                id="stockRemarks"
                                rows={2}
                                value={stockRemarks}
                                onChange={(e) => setStockRemarks(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setStockFormOpen(false)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={saveStockTransaction} disabled={savingStock}>
                                {savingStock ? "Saving..." : "Log Transaction"}
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="mt-5 space-y-2">
                          {storeStocksLoading ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                          ) : storeStocks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No stock transactions logged yet.</p>
                          ) : (
                            storeStocks.slice(0, 20).map((s) => {
                              const product = storeProducts.find((p) => p.id === s.store_product_id);
                              return (
                                <div
                                  key={s.id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
                                >
                                  <div>
                                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                      {product?.medicine_name ?? `Product #${s.store_product_id}`}
                                      <span
                                        className={cn(
                                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                          s.transaction_type === "purchase" && "bg-primary/10 text-primary",
                                          s.transaction_type === "sale" &&
                                            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                                          s.transaction_type === "return" &&
                                            "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                                          s.transaction_type === "adjustment" &&
                                            "bg-secondary text-secondary-foreground"
                                        )}
                                      >
                                        {s.transaction_type}
                                      </span>
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                      {formatDateForDisplay(s.transaction_date.slice(0, 10))} · {s.quantity} units ×
                                      ৳{s.unit_price} = ৳{s.total_price}
                                    </p>
                                    {s.remarks && (
                                      <p className="mt-1 text-xs text-muted-foreground italic">
                                        &ldquo;{s.remarks}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === "pos" && isPatient && myStore && (
                  <motion.div
                    key="pos"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <Card className="border-border/60 p-6">
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <ShoppingCart className="size-4 text-primary" />
                            Point of Sale
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Search a product and add it to the cart.
                          </p>

                          <div className="relative mt-4">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={posQuery}
                              onChange={(e) => setPosQuery(e.target.value)}
                              placeholder="Search products…"
                              className="pl-8"
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                            {storeProducts
                              .filter((p) => p.is_active)
                              .filter(
                                (p) =>
                                  !posQuery.trim() ||
                                  (p.medicine_name ?? "").toLowerCase().includes(posQuery.trim().toLowerCase())
                              )
                              .map((p) => {
                                const outOfStock = (p.current_stock ?? 0) <= 0;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => addToCart(p)}
                                    disabled={outOfStock}
                                    className="group relative flex flex-col items-start gap-1 rounded-xl border border-border/60 bg-background p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
                                  >
                                    <span className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {p.medicine_name ?? `Medicine #${p.medicine_id}`}
                                    </span>
                                    <span className="text-base font-bold text-primary">৳{p.sale_price}</span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {outOfStock ? "Out of stock" : `${p.current_stock} in stock`}
                                    </span>
                                    {!outOfStock && (
                                      <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                        <Plus className="size-3" />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            {storeProducts.filter((p) => p.is_active).length === 0 && (
                              <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                                No active products yet — add some from the My Store tab.
                              </p>
                            )}
                          </div>
                        </Card>
                      </div>

                      <div className="lg:col-span-1">
                        <Card className="overflow-hidden border-border/60 p-0 lg:sticky lg:top-24">
                          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
                            <Receipt className="size-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Current Sale</h3>
                            {posCart.length > 0 && (
                              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                {posCart.reduce((n, c) => n + c.qty, 0)} item
                                {posCart.reduce((n, c) => n + c.qty, 0) === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>

                          {posCart.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                              <ShoppingCart className="size-7 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Tap a product on the left to add it here.
                              </p>
                            </div>
                          ) : (
                            <div className="px-5 py-4">
                              <div className="max-h-64 space-y-3 overflow-y-auto">
                                {posCart.map((item) => (
                                  <div key={item.productId} className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        ৳{item.price} × {item.qty} = ৳{(item.price * item.qty).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                      <Button
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => updateCartQty(item.productId, item.qty - 1)}
                                        aria-label="Decrease"
                                      >
                                        <Minus />
                                      </Button>
                                      <Input
                                        type="number"
                                        min={1}
                                        value={item.qty}
                                        onChange={(e) => updateCartQty(item.productId, Number(e.target.value) || 1)}
                                        className="h-7 w-14 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                      />
                                      <Button
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => updateCartQty(item.productId, item.qty + 1)}
                                        aria-label="Increase"
                                      >
                                        <Plus />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFromCart(item.productId)}
                                        aria-label="Remove"
                                      >
                                        <X />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <Separator className="my-4" />

                              <div className="space-y-1">
                                <Label className="text-xs">Customer (optional)</Label>
                                {posCustomer ? (
                                  <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {posCustomer.name}
                                      </p>
                                      <p className="truncate text-xs text-muted-foreground">
                                        {posCustomer.phone}
                                        {posCustomer.address ? ` · ${posCustomer.address}` : ""}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={clearPosCustomer}
                                      aria-label="Change customer"
                                    >
                                      <X />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1.5">
                                    <div className="relative flex-1">
                                      <Phone className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        value={posCustomerPhone}
                                        onChange={(e) => {
                                          setPosCustomerPhone(e.target.value);
                                          setPosCustomerNotFound(false);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            searchPosCustomer();
                                          }
                                        }}
                                        placeholder="Phone number"
                                        className="h-8 pl-8"
                                      />
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={searchPosCustomer}
                                      disabled={posCustomerLoading || !posCustomerPhone.trim()}
                                      aria-label="Search customer"
                                    >
                                      <Search />
                                    </Button>
                                  </div>
                                )}
                                {posCustomerLoading && (
                                  <p className="text-xs text-muted-foreground">Searching…</p>
                                )}
                                {posCustomerNotFound && !posCustomerLoading && (
                                  <div className="space-y-2 rounded-lg border border-dashed border-border/60 p-2.5">
                                    <p className="text-xs text-muted-foreground">
                                      No account for {posCustomerPhone} — add as a new customer?
                                    </p>
                                    <Input
                                      value={posNewCustomerName}
                                      onChange={(e) => setPosNewCustomerName(e.target.value)}
                                      placeholder="Customer name"
                                      className="h-8"
                                    />
                                    <Button
                                      size="sm"
                                      className="w-full"
                                      onClick={createPosCustomer}
                                      disabled={posCustomerCreating}
                                    >
                                      {posCustomerCreating ? "Adding..." : "Add Customer"}
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <Label htmlFor="posDiscount" className="text-xs whitespace-nowrap">
                                    Discount
                                  </Label>
                                  <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                                      ৳
                                    </span>
                                    <Input
                                      id="posDiscount"
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      className="h-8 pl-6"
                                      value={posDiscount}
                                      onChange={(e) => setPosDiscount(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="posDeliveryFee" className="text-xs whitespace-nowrap">
                                    Delivery
                                  </Label>
                                  <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                                      ৳
                                    </span>
                                    <Input
                                      id="posDeliveryFee"
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      className="h-8 pl-6"
                                      value={posDeliveryFee}
                                      onChange={(e) => setPosDeliveryFee(e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2.5 space-y-1">
                                <Label htmlFor="posPaymentMethod" className="text-xs">
                                  Payment Method
                                </Label>
                                <Select value={posPaymentMethod} onValueChange={(v) => setPosPaymentMethod(v ?? "Cash")}>
                                  <SelectTrigger className="h-8 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Card">Card</SelectItem>
                                    <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="mt-2.5 space-y-1">
                                <Label htmlFor="posNotes" className="text-xs">
                                  Notes (optional)
                                </Label>
                                <Input
                                  id="posNotes"
                                  className="h-8"
                                  value={posNotes}
                                  onChange={(e) => setPosNotes(e.target.value)}
                                />
                              </div>

                              <div className="mt-4 space-y-1 text-sm">
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span>Subtotal</span>
                                  <span>৳{posTotal.toFixed(2)}</span>
                                </div>
                                {Number(posDiscount) > 0 && (
                                  <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Discount</span>
                                    <span>−৳{Number(posDiscount).toFixed(2)}</span>
                                  </div>
                                )}
                                {Number(posDeliveryFee) > 0 && (
                                  <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Delivery Fee</span>
                                    <span>৳{Number(posDeliveryFee).toFixed(2)}</span>
                                  </div>
                                )}
                              </div>

                              {(() => {
                                const grandTotal = Math.max(
                                  0,
                                  posTotal - Number(posDiscount || 0) + Number(posDeliveryFee || 0)
                                );
                                return (
                                  <>
                                    <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                                      <span className="font-semibold text-foreground">Total</span>
                                      <span className="text-xl font-bold text-primary">
                                        ৳{grandTotal.toFixed(2)}
                                      </span>
                                    </div>

                                    <Button
                                      className="mt-3 w-full"
                                      size="lg"
                                      onClick={completeSale}
                                      disabled={posSubmitting}
                                    >
                                      {posSubmitting ? "Processing..." : `Complete Sale · ৳${grandTotal.toFixed(2)}`}
                                    </Button>
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {lastOrder && (
                            <div className="mx-5 mb-5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                              <p className="text-sm font-semibold text-foreground">
                                Order {lastOrder.order_number} completed
                              </p>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                {lastOrder.items.map((item, i) => (
                                  <div key={item.id ?? i} className="flex justify-between">
                                    <span>
                                      {item.medicine_name ?? `Item #${item.store_product_id}`} × {item.quantity}
                                    </span>
                                    <span>৳{Number(item.total_price).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 flex justify-between border-t border-border/60 pt-2 text-sm font-semibold text-foreground">
                                <span>Total</span>
                                <span>৳{Number(lastOrder.total).toFixed(2)}</span>
                              </div>
                              <div className="mt-3 flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setPrintInvoiceMode("80mm")}
                                >
                                  <Printer />
                                  Print 80mm Receipt
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setPrintInvoiceMode("a4")}
                                >
                                  <Printer />
                                  Print A4 Invoice
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "pos" && isPatient && !myStore && !myStoreLoading && (
                  <motion.div
                    key="pos-empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
                      <Store className="size-8 text-muted-foreground" />
                      <p className="font-semibold text-foreground">No store yet</p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Register a store and add products before you can use the POS.
                      </p>
                      <Button size="sm" onClick={() => handleTabChange("store")}>
                        Go to My Store
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "store-orders" && isPatient && myStore && (
                  <motion.div
                    key="store-orders"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-border/60 p-6">
                      <h3 className="flex items-center gap-2 font-semibold text-foreground">
                        <ClipboardList className="size-4 text-primary" />
                        My Orders
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">Orders placed at your store.</p>

                      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                        {(["all", ...ORDER_STATUS_OPTIONS.map((o) => o.value)] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setOrderStatusFilter(s)}
                            className={cn(
                              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                              orderStatusFilter === s
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                          >
                            {s === "all" ? "All" : ORDER_STATUS_OPTIONS.find((o) => o.value === s)?.label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 space-y-2">
                        {storeOrdersLoading ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : (
                          (() => {
                            const filtered =
                              orderStatusFilter === "all"
                                ? storeOrders
                                : storeOrders.filter((o) => o.status === orderStatusFilter);
                            if (filtered.length === 0 && storeOrdersFailed) {
                              return (
                                <div className="flex flex-col items-center gap-2 py-10 text-center">
                                  <p className="text-sm font-semibold text-foreground">Couldn&apos;t load orders</p>
                                  <p className="text-xs text-muted-foreground">
                                    We couldn&apos;t reach the server.
                                  </p>
                                  <Button variant="outline" size="sm" onClick={refreshStoreOrders}>
                                    <RefreshCw />
                                    Retry
                                  </Button>
                                </div>
                              );
                            }
                            if (filtered.length === 0) {
                              return (
                                <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                                  No orders yet.
                                </p>
                              );
                            }
                            return filtered.map((order) => (
                              <button
                                key={order.id}
                                type="button"
                                onClick={() => setOrderDetailsView(order)}
                                className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-4 text-left transition-colors hover:border-primary/40"
                              >
                                <div>
                                  <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                                    {order.order_number}
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                        orderStatusStyles[order.status]
                                      )}
                                    >
                                      {ORDER_STATUS_OPTIONS.find((o) => o.value === order.status)?.label ??
                                        order.status}
                                    </span>
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                                    {(order.placed_at ?? order.created_at) &&
                                      ` · ${formatDateForDisplay((order.placed_at ?? order.created_at ?? "").slice(0, 10))}`}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-foreground">
                                  ৳{Number(order.total).toFixed(2)}
                                </p>
                              </button>
                            ));
                          })()
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "store-orders" && isPatient && !myStore && !myStoreLoading && (
                  <motion.div
                    key="store-orders-empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
                      <Store className="size-8 text-muted-foreground" />
                      <p className="font-semibold text-foreground">No store yet</p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Register a store to start seeing orders here.
                      </p>
                      <Button size="sm" onClick={() => handleTabChange("store")}>
                        Go to My Store
                      </Button>
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
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                                      {formatTimeDisplay(s.start_time)} – {formatTimeDisplay(s.end_time)}
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
                      <>
                        {addAppointmentPanel}

                        <Card className="p-6">
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                              <FileText className="size-4 text-muted-foreground" />
                              Prescription History
                            </h3>
                            {prescriptionHistoryLoading ? (
                              <p className="mt-4 text-sm text-muted-foreground">Loading recent prescriptions…</p>
                            ) : prescriptionHistory.length === 0 ? (
                              <p className="mt-4 text-sm text-muted-foreground">
                                No prescriptions issued yet.
                              </p>
                            ) : (
                              <div className="mt-4 space-y-2">
                                {prescriptionHistory.map((rx) => (
                                  <div key={rx.id} className="rounded-xl border border-border/60 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-medium text-foreground">
                                          {patientLabelForPrescription(rx)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {rx.prescription_date
                                            ? formatDateForDisplay(rx.prescription_date.slice(0, 10))
                                            : "—"}
                                          {" · "}
                                          {(rx.medicines ?? []).length} medicine
                                          {(rx.medicines ?? []).length === 1 ? "" : "s"}
                                        </p>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPrescriptionDetailsView(rx)}>
                                          <Eye />
                                          View Details
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setViewingPrescription(rx)}>
                                          <Printer />
                                          Print
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card>
                        </>
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
                              // handleTabChange keeps the ?appointment= param
                              // when the destination is "prescriptions" (that's
                              // what lets "Create Prescription" jump straight
                              // into the form) — clear it explicitly here so
                              // landing back on Prescriptions shows the home/
                              // gate screen instead of re-opening this same
                              // now-already-prescribed appointment.
                              const params = new URLSearchParams(searchParams.toString());
                              params.set("tab", "prescriptions");
                              params.delete("appointment");
                              router.replace(`/dashboard?${params.toString()}`, { scroll: false });
                              setActiveTab("prescriptions");
                            }}
                          >
                            <FileText />
                            Back to Prescriptions
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

                        <div className="mt-6 rounded-xl border border-border/60 bg-secondary/20 p-6 text-left">
                          {renderPrescriptionDetails(createdPrescription)}
                        </div>
                      </Card>
                    ) : (
                      <Card className="border-l-4 border-border/60 border-l-amber-400 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 p-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={
                                rxAppointment.user_patient?.name?.trim() || `Patient #${rxAppointment.user_patient_id}`
                              }
                              imageUrl={rxAppointment.user_patient?.profile_image}
                              gender={rxAppointment.user_patient?.gender}
                              className="size-12"
                            />
                            <div>
                              <p className="text-xs font-medium tracking-wide text-amber-600 uppercase dark:text-amber-400">
                                Creating prescription for
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                {rxAppointment.user_patient?.name?.trim() || `Patient #${rxAppointment.user_patient_id}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {rxAppointment.user_patient?.phone && `${rxAppointment.user_patient.phone} · `}
                                Appointment #{rxAppointment.id} ·{" "}
                                {formatDateForDisplay(rxAppointment.appointment_date.slice(0, 10))}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRxAppointmentId(null);
                              resetPrescriptionForm();
                              handleTabChange("appointments");
                            }}
                          >
                            Change Appointment
                          </Button>
                        </div>

                        <div className="mt-5 space-y-5">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Activity className="size-4 text-amber-600 dark:text-amber-400" />
                              Vitals
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-3">
                                <Label htmlFor="rxIsSmoking" className="cursor-pointer">
                                  Patient smokes
                                </Label>
                                <Switch id="rxIsSmoking" checked={rxIsSmoking} onCheckedChange={setRxIsSmoking} />
                              </div>
                              <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-3">
                                <Label htmlFor="rxIsDiabetic" className="cursor-pointer">
                                  Patient is diabetic
                                </Label>
                                <Switch
                                  id="rxIsDiabetic"
                                  checked={rxIsDiabetic}
                                  onCheckedChange={(checked) => {
                                    setRxIsDiabetic(checked);
                                    if (!checked) setRxSugarLevel("");
                                  }}
                                />
                              </div>
                            </div>
                            {rxIsDiabetic && (
                              <div className="mt-3 space-y-1.5">
                                <Label htmlFor="rxSugarLevel">Sugar Level</Label>
                                <Input
                                  id="rxSugarLevel"
                                  placeholder="e.g. 5.6 mmol/L"
                                  value={rxSugarLevel}
                                  onChange={(e) => setRxSugarLevel(e.target.value)}
                                />
                              </div>
                            )}
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
                            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Pill className="size-4 text-amber-600 dark:text-amber-400" />
                              Medicines
                            </p>
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
                                    placeholder="Search medicine — name & strength, e.g. Napa 500mg…"
                                  />
                                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <Select
                                      value={row.schedule}
                                      onValueChange={(v) => updateMedicineRow(i, "schedule", v ?? "")}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Schedule">
                                          {(value: string) =>
                                            MEDICINE_SCHEDULE_OPTIONS.find((opt) => opt.value === value)?.label ??
                                            "Schedule"
                                          }
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {MEDICINE_SCHEDULE_OPTIONS.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder="Duration (e.g. 7 days)"
                                      value={row.duration}
                                      onChange={(e) => updateMedicineRow(i, "duration", e.target.value)}
                                    />
                                    <Select value={row.notes} onValueChange={(v) => updateMedicineRow(i, "notes", v ?? "")}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Meal timing">
                                          {(value: string) =>
                                            MEDICINE_TIMING_OPTIONS.find((opt) => opt.value === value)?.label ??
                                            "Meal timing"
                                          }
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {MEDICINE_TIMING_OPTIONS.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {i === rxMedicines.length - 1 && (
                                    <div className="mt-3 flex justify-end">
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
                                  )}
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

                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Left-side tab menu — comes first on every breakpoint (a
                mobile visitor shouldn't have to scroll past all the tab
                content to find navigation); becomes a vertical sticky
                sidebar at lg. */}
            <div className="order-1">
              <Card className="border-border/60 p-2 lg:sticky lg:top-24">
                <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:grid-cols-none lg:flex-col">
                  {(isDoctor ? doctorPersonalNavItems : isPatient ? patientNavItems : profileOnlyNavItems)
                    // Blood Donor only clutters the menu once it's relevant —
                    // before then, the quick-link button above the tabs is
                    // the entry point. Ambulance and Store live in their own
                    // sectioned groups below, not this flat list.
                    .filter((item) => item.key !== "blood-donor" || isBloodDonor)
                    .map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleTabChange(item.key)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors lg:gap-2.5 lg:px-3",
                          activeTab === item.key
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                </nav>

                {hasAmbulance && (
                  <>
                    <Separator className="my-1.5" />
                    <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-3 py-2 text-sky-600 dark:text-sky-400">
                      <Ambulance className="size-3.5 shrink-0" />
                      <p className="text-[11px] font-semibold tracking-wider uppercase">Ambulance</p>
                    </div>
                    <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:grid-cols-none lg:flex-col">
                      {ambulanceToolsNavItems.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleTabChange(item.key)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors lg:gap-2.5 lg:px-3",
                            activeTab === item.key
                              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                              : "text-muted-foreground hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </>
                )}

                {hasStore && (
                  <>
                    <Separator className="my-1.5" />
                    <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-600 dark:text-emerald-400">
                      <Store className="size-3.5 shrink-0" />
                      <p className="text-[11px] font-semibold tracking-wider uppercase">Store Tools</p>
                    </div>
                    <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:grid-cols-none lg:flex-col">
                      {storeToolsNavItems.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleTabChange(item.key)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors lg:gap-2.5 lg:px-3",
                            activeTab === item.key
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </>
                )}

                {isDoctor && (
                  <>
                    <Separator className="my-1.5" />
                    <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-amber-600 dark:text-amber-400">
                      <Stethoscope className="size-3.5 shrink-0" />
                      <p className="text-[11px] font-semibold tracking-wider uppercase">Doctor Tools</p>
                    </div>
                    <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:grid-cols-none lg:flex-col">
                      {doctorToolsNavItems.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleTabChange(item.key)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors lg:gap-2.5 lg:px-3",
                            activeTab === item.key
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </>
                )}

                <Separator className="my-1.5" />
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="size-4 shrink-0" />
                  Log Out
                </button>
              </Card>
            </div>
          </div>
        </section>

        {printablePrescription && (
          // Print-only A4 layout — hidden on screen, revealed by the
          // #prescription-print-area rule in globals.css. Kept outside the
          // tab-switched content so it stays mounted (and printable)
          // regardless of which tab — doctor or patient side — triggered it.
          <div id="prescription-print-area" className="hidden">
            {renderPrescriptionDetails(printablePrescription)}
            <div className="mt-16 flex justify-end">
              <div className="w-56 border-t border-foreground pt-1 text-center text-xs">Signature</div>
            </div>
          </div>
        )}

        {lastOrder && (
          // Print-only invoice — same "hidden on screen, revealed only by
          // the matching globals.css rule" pattern as the prescription area
          // above. data-print-size picks which named @page box (and font
          // size) applies, set right before print() fires by whichever
          // button was clicked.
          <div id="order-invoice-print-area" data-print-size={printInvoiceMode ?? "a4"} className="hidden">
            <div className="text-center">
              <p className="text-base font-bold">{myStore?.store_name}</p>
              {myStore?.store_address && <p className="text-xs">{myStore.store_address}</p>}
              {myStore?.phone && <p className="text-xs">{myStore.phone}</p>}
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span>Order #{lastOrder.order_number}</span>
              <span>
                {new Date(lastOrder.placed_at ?? lastOrder.created_at ?? Date.now()).toLocaleString()}
              </span>
            </div>
            {lastOrderCustomer && (
              <p className="mt-1 text-xs">
                Customer: {lastOrderCustomer.name}
                {lastOrderCustomer.phone && ` · ${lastOrderCustomer.phone}`}
                {lastOrderCustomer.address && ` · ${lastOrderCustomer.address}`}
              </p>
            )}
            <div className="mt-2 border-t border-dashed border-black" />
            <table className="mt-2 w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left font-semibold">Item</th>
                  <th className="text-right font-semibold">Qty</th>
                  <th className="text-right font-semibold">Price</th>
                  <th className="text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastOrder.items.map((item, i) => (
                  <tr key={item.id ?? i}>
                    <td>{item.medicine_name ?? `Item #${item.store_product_id}`}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{Number(item.unit_price).toFixed(2)}</td>
                    <td className="text-right">{Number(item.total_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 border-t border-dashed border-black" />
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{Number(lastOrder.subtotal).toFixed(2)}</span>
              </div>
              {Number(lastOrder.discount) > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>−৳{Number(lastOrder.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(lastOrder.delivery_fee) > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>৳{Number(lastOrder.delivery_fee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-black pt-1 text-sm font-bold">
                <span>Total</span>
                <span>৳{Number(lastOrder.total).toFixed(2)}</span>
              </div>
            </div>
            {lastOrder.payment_method && (
              <p className="mt-2 text-xs">Payment: {lastOrder.payment_method}</p>
            )}
            <p className="mt-4 text-center text-xs">Thank you for your purchase!</p>
          </div>
        )}

        {/* "View Details" modal — a dialog instead of expanding a row in
            place, since a list with a hundred-plus prescriptions in it
            would get unwieldy if every "expanded" row pushed the rest of
            the list down. Kept outside the tab-switched content, same
            reasoning as the print area above, so it opens correctly no
            matter which of the four prescription lists triggered it. */}
        <Dialog
          open={prescriptionDetailsView != null}
          onOpenChange={(open) => {
            if (!open) setPrescriptionDetailsView(null);
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            {prescriptionDetailsView && (
              <div className="-mx-1.5 max-h-[65vh] overflow-y-auto px-1.5 py-1">
                {renderPrescriptionDetails(prescriptionDetailsView)}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrescriptionDetailsView(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  if (prescriptionDetailsView) setViewingPrescription(prescriptionDetailsView);
                  setPrescriptionDetailsView(null);
                }}
              >
                <Printer />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={orderDetailsView != null}
          onOpenChange={(open) => {
            if (!open) setOrderDetailsView(null);
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Order {orderDetailsView?.order_number}</DialogTitle>
            </DialogHeader>
            {orderDetailsView && (
              <div className="-mx-1.5 max-h-[65vh] space-y-4 overflow-y-auto px-1.5 py-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={orderDetailsView.status}
                      onValueChange={(v) => {
                        if (v) changeOrderStatus(orderDetailsView, v as OrderStatus);
                      }}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue>
                          {(value: OrderStatus) =>
                            ORDER_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {updatingOrderStatus && <p className="text-xs text-muted-foreground">Saving…</p>}
                </div>

                <div className="space-y-2 rounded-xl border border-border/60 p-3">
                  {orderDetailsView.items.map((item, i) => (
                    <div key={item.id ?? i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-foreground">
                        {item.medicine_name ?? `Item #${item.store_product_id}`} × {item.quantity}
                      </span>
                      <span className="text-muted-foreground">৳{Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳{Number(orderDetailsView.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(orderDetailsView.discount) > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span>−৳{Number(orderDetailsView.discount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(orderDetailsView.delivery_fee) > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>৳{Number(orderDetailsView.delivery_fee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>৳{Number(orderDetailsView.total).toFixed(2)}</span>
                  </div>
                </div>

                {orderDetailsView.payment_method && (
                  <p className="text-xs text-muted-foreground">
                    Payment: {orderDetailsView.payment_method} · {orderDetailsView.payment_status}
                  </p>
                )}
                {orderDetailsView.notes && (
                  <p className="text-xs text-muted-foreground italic">&ldquo;{orderDetailsView.notes}&rdquo;</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderDetailsView(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (orderDetailsView) printOrderFromHistory(orderDetailsView, "80mm");
                }}
              >
                <Printer />
                Print 80mm
              </Button>
              <Button
                onClick={() => {
                  if (orderDetailsView) printOrderFromHistory(orderDetailsView, "a4");
                }}
              >
                <Printer />
                Print A4
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
