export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

export const appointments: Appointment[] = [
  {
    id: "apt-001",
    doctorId: "farhan-chowdhury",
    doctorName: "Dr. Farhan Chowdhury",
    specialty: "Cardiology",
    hospital: "Apollo Hospitals, Dhaka",
    date: "2026-07-24",
    time: "5:00 PM",
    status: "Upcoming",
  },
  {
    id: "apt-002",
    doctorId: "tania-parvin",
    doctorName: "Dr. Tania Parvin",
    specialty: "ENT",
    hospital: "Popular Diagnostic Centre",
    date: "2026-08-02",
    time: "4:45 PM",
    status: "Upcoming",
  },
  {
    id: "apt-003",
    doctorId: "nusrat-jahan",
    doctorName: "Dr. Nusrat Jahan",
    specialty: "Dermatology",
    hospital: "Square Hospital",
    date: "2026-06-18",
    time: "5:45 PM",
    status: "Completed",
  },
  {
    id: "apt-004",
    doctorId: "mehedi-hasan",
    doctorName: "Dr. Mehedi Hasan",
    specialty: "General Physician",
    hospital: "Ibnocare Community Clinic",
    date: "2026-05-30",
    time: "10:00 AM",
    status: "Completed",
  },
  {
    id: "apt-005",
    doctorId: "kamrul-islam",
    doctorName: "Dr. Kamrul Islam",
    specialty: "Orthopedics",
    hospital: "Labaid Specialized Hospital",
    date: "2026-05-10",
    time: "11:30 AM",
    status: "Cancelled",
  },
];

export interface Prescription {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  medicines: { name: string; dosage: string; duration: string }[];
  notes: string;
}

export const prescriptions: Prescription[] = [
  {
    id: "rx-001",
    doctorName: "Dr. Farhan Chowdhury",
    specialty: "Cardiology",
    date: "2026-06-18",
    medicines: [
      { name: "Atorvastatin 10mg", dosage: "1 tablet at night", duration: "30 days" },
      { name: "Aspirin 75mg", dosage: "1 tablet after breakfast", duration: "30 days" },
    ],
    notes: "Follow up after 4 weeks with a fresh lipid profile.",
  },
  {
    id: "rx-002",
    doctorName: "Dr. Mehedi Hasan",
    specialty: "General Physician",
    date: "2026-05-30",
    medicines: [
      { name: "Azithromycin 500mg", dosage: "1 tablet once daily", duration: "3 days" },
      { name: "Paracetamol 500mg", dosage: "1 tablet as needed", duration: "5 days" },
    ],
    notes: "Plenty of fluids and rest. Return if fever persists beyond 3 days.",
  },
];

export interface DiagnosticReport {
  id: string;
  testName: string;
  centreName: string;
  date: string;
  status: "Ready" | "Processing";
}

export const diagnosticReports: DiagnosticReport[] = [
  {
    id: "dr-001",
    testName: "Lipid Profile",
    centreName: "Popular Diagnostic Centre, Dhanmondi",
    date: "2026-06-15",
    status: "Ready",
  },
  {
    id: "dr-002",
    testName: "Complete Blood Count (CBC)",
    centreName: "Ibn Sina Diagnostic, Mirpur",
    date: "2026-05-28",
    status: "Ready",
  },
  {
    id: "dr-003",
    testName: "Chest X-Ray",
    centreName: "Labaid Diagnostic, Dhanmondi",
    date: "2026-07-20",
    status: "Processing",
  },
];

export interface PatientReview {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  rating: number;
  comment: string;
  date: string;
}

export const patientReviews: PatientReview[] = [
  {
    id: "rev-001",
    doctorId: "nusrat-jahan",
    doctorName: "Dr. Nusrat Jahan",
    specialty: "Dermatology",
    rating: 5,
    comment: "Very thorough and explained my treatment plan clearly. Highly recommend.",
    date: "2026-06-19",
  },
  {
    id: "rev-002",
    doctorId: "mehedi-hasan",
    doctorName: "Dr. Mehedi Hasan",
    specialty: "General Physician",
    rating: 4,
    comment: "Good consultation, though the wait time was a bit long.",
    date: "2026-05-31",
  },
];
