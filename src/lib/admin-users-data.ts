export type AccountRole = "Patient" | "Doctor" | "Driver" | "Pharmacist" | "Admin";
export type AccountStatus = "Active" | "Suspended";

export interface AdminManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  avatar: string;
  joined: string;
}

export const roleOptions: AccountRole[] = ["Patient", "Doctor", "Driver", "Pharmacist", "Admin"];

export const adminUsers: AdminManagedUser[] = [
  {
    id: "user-patient-001",
    name: "Amina Rahman",
    email: "patient@ibnocare.com",
    phone: "+880 1711-556677",
    role: "Patient",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=47",
    joined: "2025-01-12",
  },
  {
    id: "user-doctor-001",
    name: "Dr. Farhan Chowdhury",
    email: "doctor@ibnocare.com",
    phone: "+880 1712-340011",
    role: "Doctor",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=12",
    joined: "2024-03-01",
  },
  {
    id: "user-driver-001",
    name: "Mizanur Rahman",
    email: "driver@ibnocare.com",
    phone: "+880 1712-340099",
    role: "Driver",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=14",
    joined: "2024-06-18",
  },
  {
    id: "user-pharmacist-001",
    name: "Sultana Begum",
    email: "pharmacist@ibnocare.com",
    phone: "+880 10678-747411",
    role: "Pharmacist",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=32",
    joined: "2024-09-05",
  },
  {
    id: "user-admin-001",
    name: "Admin",
    email: "admin@ibnocare.com",
    phone: "+880 1600-000000",
    role: "Admin",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=68",
    joined: "2023-11-20",
  },
  {
    id: "user-patient-002",
    name: "Rezaul Karim",
    email: "rezaul.karim@example.com",
    phone: "+880 1812-123456",
    role: "Patient",
    status: "Suspended",
    avatar: "https://i.pravatar.cc/150?img=8",
    joined: "2025-04-02",
  },
];

export function getAdminUserById(id: string) {
  return adminUsers.find((u) => u.id === id);
}
