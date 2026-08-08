export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  assignedDoctorId?: string;
  lastVisit: string;
  status: "Active" | "Inactive";
}

export const bloodGroupOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const patients: Patient[] = [
  {
    id: "patient-001",
    name: "Amina Rahman",
    age: 29,
    gender: "Female",
    bloodGroup: "O+",
    phone: "+880 1711-556677",
    email: "patient@ibnocare.com",
    address: "Road 8, Dhanmondi, Dhaka",
    assignedDoctorId: "farhan-chowdhury",
    lastVisit: "2026-06-18",
    status: "Active",
  },
  {
    id: "patient-002",
    name: "Rezaul Karim",
    age: 41,
    gender: "Male",
    bloodGroup: "A+",
    phone: "+880 1812-123456",
    email: "rezaul.karim@example.com",
    address: "Banani, Dhaka",
    assignedDoctorId: "nusrat-jahan",
    lastVisit: "2026-06-02",
    status: "Active",
  },
  {
    id: "patient-003",
    name: "Shirin Akter",
    age: 34,
    gender: "Female",
    bloodGroup: "B+",
    phone: "+880 1911-334455",
    email: "shirin.akter@example.com",
    address: "Uttara, Dhaka",
    assignedDoctorId: "farzana-akter",
    lastVisit: "2026-05-27",
    status: "Active",
  },
  {
    id: "patient-004",
    name: "Tanvir Ahmed",
    age: 52,
    gender: "Male",
    bloodGroup: "AB+",
    phone: "+880 1611-778899",
    email: "tanvir.ahmed@example.com",
    address: "Gulshan, Dhaka",
    assignedDoctorId: "kamrul-islam",
    lastVisit: "2026-04-14",
    status: "Inactive",
  },
  {
    id: "patient-005",
    name: "Nusrat Jahan Mim",
    age: 8,
    gender: "Female",
    bloodGroup: "O-",
    phone: "+880 1511-990022",
    email: "guardian.mim@example.com",
    address: "Mirpur, Dhaka",
    assignedDoctorId: "imran-hossain",
    lastVisit: "2026-06-25",
    status: "Active",
  },
  {
    id: "patient-006",
    name: "Kamal Hossain",
    age: 63,
    gender: "Male",
    bloodGroup: "A-",
    phone: "+880 1712-445566",
    email: "kamal.hossain@example.com",
    address: "Dhanmondi, Dhaka",
    assignedDoctorId: "sabrina-alam",
    lastVisit: "2026-03-30",
    status: "Active",
  },
  {
    id: "patient-007",
    name: "Farhana Yasmin",
    age: 27,
    gender: "Female",
    bloodGroup: "B-",
    phone: "+880 1812-667788",
    email: "farhana.yasmin@example.com",
    address: "Bashundhara R/A, Dhaka",
    assignedDoctorId: "afsana-mimi",
    lastVisit: "2026-06-10",
    status: "Active",
  },
  {
    id: "patient-008",
    name: "Jahangir Alam",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    phone: "+880 1911-556600",
    email: "jahangir.alam@example.com",
    address: "Mohakhali, Dhaka",
    assignedDoctorId: "tania-parvin",
    lastVisit: "2026-02-19",
    status: "Inactive",
  },
];

export function getPatientById(id: string) {
  return patients.find((p) => p.id === id);
}
