export type ConsultationMode = "Online" | "Offline" | "Both";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  rating: number;
  reviews: number;
  experience: number;
  fee: number;
  verified: boolean;
  chamber: {
    hospital: string;
    address: string;
    days: string;
    time: string;
  };
  bio: string;
  education: string[];
  languages: string[];
  availableSlots: string[];
  consultationMode?: ConsultationMode;
  leaveDates?: string[];
}

export const specialties = [
  "All",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "Gynecology",
  "Dentistry",
  "ENT",
  "General Physician",
  "Psychiatry",
];

export const doctors: Doctor[] = [
  {
    id: "farhan-chowdhury",
    name: "Dr. Farhan Chowdhury",
    specialty: "Cardiology",
    photo: "https://i.pravatar.cc/300?img=12",
    rating: 4.9,
    reviews: 214,
    experience: 12,
    fee: 800,
    verified: true,
    chamber: {
      hospital: "Apollo Hospitals, Dhaka",
      address: "Bashundhara R/A, Dhaka",
      days: "Sun – Thu",
      time: "5:00 PM – 8:00 PM",
    },
    bio: "Dr. Farhan Chowdhury is a consultant cardiologist with over a decade of experience in interventional cardiology, specializing in coronary artery disease and heart failure management.",
    education: ["MBBS – Dhaka Medical College", "FCPS (Cardiology)", "Fellowship in Interventional Cardiology, Singapore"],
    languages: ["English", "Bengali"],
    availableSlots: ["10:00", "11:30", "3:00", "4:15", "5:00", "6:30"],
  },
  {
    id: "nusrat-jahan",
    name: "Dr. Nusrat Jahan",
    specialty: "Dermatology",
    photo: "https://i.pravatar.cc/300?img=32",
    rating: 4.8,
    reviews: 178,
    experience: 8,
    fee: 700,
    verified: true,
    chamber: {
      hospital: "Square Hospital",
      address: "Panthapath, Dhaka",
      days: "Sat – Wed",
      time: "4:00 PM – 7:00 PM",
    },
    bio: "Dr. Nusrat Jahan focuses on medical and cosmetic dermatology, with special interest in acne management, skin allergies, and laser treatments.",
    education: ["MBBS – Sir Salimullah Medical College", "MD (Dermatology & Venereology)"],
    languages: ["English", "Bengali", "Hindi"],
    availableSlots: ["9:30", "10:15", "11:00", "5:00", "5:45", "6:30"],
  },
  {
    id: "imran-hossain",
    name: "Dr. Imran Hossain",
    specialty: "Pediatrics",
    photo: "https://i.pravatar.cc/300?img=51",
    rating: 4.9,
    reviews: 302,
    experience: 15,
    fee: 600,
    verified: true,
    chamber: {
      hospital: "United Hospital",
      address: "Gulshan, Dhaka",
      days: "Everyday",
      time: "6:00 PM – 9:00 PM",
    },
    bio: "Dr. Imran Hossain is a senior consultant pediatrician experienced in newborn care, childhood immunization, and pediatric nutrition.",
    education: ["MBBS – Chittagong Medical College", "FCPS (Pediatrics)", "PGT in Neonatology"],
    languages: ["English", "Bengali"],
    availableSlots: ["6:00", "6:30", "7:15", "8:00", "8:30"],
  },
  {
    id: "sabrina-alam",
    name: "Dr. Sabrina Alam",
    specialty: "Neurology",
    photo: "https://i.pravatar.cc/300?img=45",
    rating: 4.7,
    reviews: 96,
    experience: 10,
    fee: 900,
    verified: true,
    chamber: {
      hospital: "Ibnocare Neuro Centre",
      address: "Dhanmondi, Dhaka",
      days: "Mon, Wed, Fri",
      time: "3:00 PM – 6:00 PM",
    },
    bio: "Dr. Sabrina Alam specializes in stroke management, epilepsy, and headache disorders, combining clinical care with patient education.",
    education: ["MBBS – Dhaka Medical College", "MD (Neurology)"],
    languages: ["English", "Bengali"],
    availableSlots: ["3:00", "3:45", "4:30", "5:15"],
  },
  {
    id: "kamrul-islam",
    name: "Dr. Kamrul Islam",
    specialty: "Orthopedics",
    photo: "https://i.pravatar.cc/300?img=13",
    rating: 4.6,
    reviews: 143,
    experience: 18,
    fee: 850,
    verified: true,
    chamber: {
      hospital: "Labaid Specialized Hospital",
      address: "Dhanmondi, Dhaka",
      days: "Sun – Thu",
      time: "11:00 AM – 2:00 PM",
    },
    bio: "Dr. Kamrul Islam is an orthopedic surgeon with expertise in joint replacement, sports injuries, and spine care.",
    education: ["MBBS – Rajshahi Medical College", "FCPS (Orthopedic Surgery)"],
    languages: ["English", "Bengali"],
    availableSlots: ["11:00", "11:30", "12:15", "1:00"],
  },
  {
    id: "farzana-akter",
    name: "Dr. Farzana Akter",
    specialty: "Gynecology",
    photo: "https://i.pravatar.cc/300?img=48",
    rating: 4.9,
    reviews: 261,
    experience: 14,
    fee: 750,
    verified: true,
    chamber: {
      hospital: "Ibn Sina Diagnostic & Consultation Centre",
      address: "Kallyanpur, Dhaka",
      days: "Sat – Wed",
      time: "5:30 PM – 8:30 PM",
    },
    bio: "Dr. Farzana Akter provides comprehensive women's health care including prenatal care, high-risk pregnancy management, and reproductive health.",
    education: ["MBBS – Dhaka Medical College", "FCPS (Gynecology & Obstetrics)"],
    languages: ["English", "Bengali"],
    availableSlots: ["5:30", "6:15", "7:00", "7:45"],
  },
  {
    id: "rafiq-ahmed",
    name: "Dr. Rafiq Ahmed",
    specialty: "Dentistry",
    photo: "https://i.pravatar.cc/300?img=15",
    rating: 4.7,
    reviews: 88,
    experience: 7,
    fee: 500,
    verified: false,
    chamber: {
      hospital: "Smile Dental Care",
      address: "Uttara, Dhaka",
      days: "Everyday",
      time: "10:00 AM – 8:00 PM",
    },
    bio: "Dr. Rafiq Ahmed offers general and cosmetic dentistry services, including root canal treatment, implants, and orthodontics.",
    education: ["BDS – Dhaka Dental College"],
    languages: ["English", "Bengali"],
    availableSlots: ["10:00", "12:00", "2:00", "4:00", "6:00"],
  },
  {
    id: "tania-parvin",
    name: "Dr. Tania Parvin",
    specialty: "ENT",
    photo: "https://i.pravatar.cc/300?img=44",
    rating: 4.5,
    reviews: 67,
    experience: 9,
    fee: 650,
    verified: true,
    chamber: {
      hospital: "Popular Diagnostic Centre",
      address: "Dhanmondi, Dhaka",
      days: "Sun, Tue, Thu",
      time: "4:00 PM – 7:00 PM",
    },
    bio: "Dr. Tania Parvin treats ear, nose, and throat conditions with a focus on sinus disorders and pediatric ENT care.",
    education: ["MBBS – Sylhet MAG Osmani Medical College", "FCPS (ENT)"],
    languages: ["English", "Bengali"],
    availableSlots: ["4:00", "4:45", "5:30", "6:15"],
  },
  {
    id: "mehedi-hasan",
    name: "Dr. Mehedi Hasan",
    specialty: "General Physician",
    photo: "https://i.pravatar.cc/300?img=33",
    rating: 4.8,
    reviews: 410,
    experience: 11,
    fee: 400,
    verified: true,
    chamber: {
      hospital: "Ibnocare Community Clinic",
      address: "Mirpur, Dhaka",
      days: "Everyday",
      time: "9:00 AM – 9:00 PM",
    },
    bio: "Dr. Mehedi Hasan provides primary care for common illnesses, chronic disease management, and preventive health checkups.",
    education: ["MBBS – Mymensingh Medical College"],
    languages: ["English", "Bengali"],
    availableSlots: ["9:00", "9:30", "10:00", "10:30", "11:00"],
  },
  {
    id: "afsana-mimi",
    name: "Dr. Afsana Mimi",
    specialty: "Psychiatry",
    photo: "https://i.pravatar.cc/300?img=47",
    rating: 4.9,
    reviews: 132,
    experience: 9,
    fee: 900,
    verified: true,
    chamber: {
      hospital: "Mind Care Clinic",
      address: "Banani, Dhaka",
      days: "Mon – Fri",
      time: "2:00 PM – 6:00 PM",
    },
    bio: "Dr. Afsana Mimi specializes in anxiety, depression, and adolescent mental health, taking a compassionate, patient-centered approach.",
    education: ["MBBS – Dhaka Medical College", "MD (Psychiatry)"],
    languages: ["English", "Bengali"],
    availableSlots: ["2:00", "2:45", "3:30", "4:15", "5:00"],
  },
];

export function getDoctorById(id: string) {
  return doctors.find((d) => d.id === id);
}
