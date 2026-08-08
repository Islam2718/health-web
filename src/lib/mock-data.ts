import {
  Stethoscope,
  Building2,
  FlaskConical,
  Ambulance,
  Pill,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Star,
  Droplet,
} from "lucide-react";

export const providerSlides = [
  {
    icon: Building2,
    category: "Hospitals & Clinics",
    headline: "Run your whole facility from one dashboard",
    description:
      "Manage departments, room & bed availability, and OT scheduling — create your hospital profile and connect with patients instantly.",
    stat: { value: "180+", label: "hospitals onboard" },
  },
  {
    icon: Stethoscope,
    category: "Doctors",
    headline: "Reach more patients, effortlessly",
    description:
      "Showcase your specialty, manage your schedule, and issue digital prescriptions — open your doctor profile and start connecting today.",
    stat: { value: "2,400+", label: "verified doctors" },
  },
  {
    icon: Pill,
    category: "Pharmacies",
    headline: "Turn foot traffic into online orders",
    description:
      "List your medicine inventory, fulfill prescriptions, and reach patients across the city as a verified Ibnocare partner store.",
    stat: { value: "600+", label: "partner pharmacies" },
  },
  {
    icon: Ambulance,
    category: "Ambulance Services",
    headline: "Respond faster, get discovered sooner",
    description:
      "Register your fleet, go live for real-time emergency requests, and get matched to the nearest patient automatically.",
    stat: { value: "3 min", label: "avg. dispatch time" },
  },
  {
    icon: FlaskConical,
    category: "Diagnostic Centres",
    headline: "Deliver results the moment they're ready",
    description:
      "Publish your test catalog and send secure digital reports straight to patient dashboards — no more waiting on printouts.",
    stat: { value: "1M+", label: "reports delivered" },
  },
];

export const careLinks = [
  { label: "Find Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Hospitals", href: "/hospitals", icon: Building2 },
  { label: "Diagnostic Centres", href: "/diagnostics", icon: FlaskConical },
  { label: "Ambulance", href: "/ambulances", icon: Ambulance },
  { label: "Medical Store & Pharmacy", href: "/medical-store", icon: Pill },
  { label: "Blood Donors", href: "/blood-donors", icon: Droplet },
];

export const services = [
  {
    icon: Stethoscope,
    title: "Find & Book Doctors",
    description:
      "Search verified doctors by specialty, check availability, and book online or in-clinic appointments in seconds.",
    href: "/doctors",
  },
  {
    icon: Building2,
    title: "Hospital Network",
    description:
      "Real-time visibility into hospital departments, room and bed availability, and operation theatre scheduling.",
    href: "/hospitals",
  },
  {
    icon: FlaskConical,
    title: "Diagnostic Centres",
    description:
      "Book pathology and imaging tests, then get digital reports delivered straight to your patient dashboard.",
    href: "/diagnostics",
  },
  {
    icon: Ambulance,
    title: "Emergency Ambulance",
    description:
      "Request the nearest available ambulance instantly and track response in real time during emergencies.",
    href: "/ambulances",
  },
  {
    icon: Pill,
    title: "Medical Store & Pharmacy",
    description:
      "Order prescribed medicines online with transparent pricing and fast doorstep or in-store pickup.",
    href: "/medical-store",
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description:
      "Doctors generate secure digital prescriptions; patients access history and reports anytime, anywhere.",
  },
];

export const stats = [
  { label: "Registered Doctors", value: "2,400+" },
  { label: "Partner Hospitals", value: "180+" },
  { label: "Appointments Booked", value: "1.2M+" },
  { label: "Patient Satisfaction", value: "98%" },
];

export const steps = [
  {
    icon: CalendarCheck,
    title: "Create your profile",
    description: "Sign up in under a minute with just your phone number and OTP verification.",
  },
  {
    icon: Stethoscope,
    title: "Search & book",
    description: "Find the right doctor, hospital, or lab test and pick a slot that works for you.",
  },
  {
    icon: ShieldCheck,
    title: "Get care, securely",
    description: "Consult, receive digital prescriptions, and manage everything from one dashboard.",
  },
];

export const testimonials = [
  {
    name: "Amina Rahman",
    role: "Patient, Dhaka",
    avatar: "https://i.pravatar.cc/100?img=47",
    quote:
      "Booking a specialist used to take days of phone calls. With Ibnocare I found a doctor and booked a slot in five minutes.",
  },
  {
    name: "Dr. Farhan Chowdhury",
    role: "Cardiologist",
    avatar: "https://i.pravatar.cc/100?img=12",
    quote:
      "Managing my schedule, patient history, and prescriptions in one dashboard has saved me hours every week.",
  },
  {
    name: "Nusrat Jahan",
    role: "Patient, Chattogram",
    avatar: "https://i.pravatar.cc/100?img=32",
    quote:
      "The ambulance request feature genuinely helped during a family emergency. Fast, reliable, and easy to use.",
  },
];

export const trustBadges = [
  { icon: ShieldCheck, label: "HIPAA-minded data privacy" },
  { icon: Star, label: "4.9/5 average rating" },
];
