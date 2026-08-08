export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: string;
  area: string;
  address: string;
  photo: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  totalDonations: number;
  lastDonation: string; // ISO date
}

export const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const donorAreas = [
  "All Areas",
  "Dhanmondi",
  "Gulshan",
  "Uttara",
  "Mirpur",
  "Banani",
  "Bashundhara",
  "Mohakhali",
];

// Eligible to donate again 90 days after the last donation.
export function getAvailability(lastDonation: string) {
  const last = new Date(lastDonation);
  const nextEligible = new Date(last);
  nextEligible.setDate(nextEligible.getDate() + 90);

  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((nextEligible.getTime() - today.getTime()) / msPerDay);

  if (daysLeft <= 0) {
    return { available: true, label: "Available Now", nextEligible };
  }
  return { available: false, label: `Available in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`, nextEligible };
}

export const bloodDonors: BloodDonor[] = [
  {
    id: "donor-001",
    name: "Tanvir Ahmed",
    bloodGroup: "O+",
    area: "Dhanmondi",
    address: "Road 8, Dhanmondi, Dhaka",
    photo: "https://i.pravatar.cc/150?img=60",
    age: 27,
    gender: "Male",
    phone: "+880 1711-100011",
    totalDonations: 12,
    lastDonation: "2026-03-15",
  },
  {
    id: "donor-002",
    name: "Farhana Islam",
    bloodGroup: "A+",
    area: "Gulshan",
    address: "Road 45, Gulshan, Dhaka",
    photo: "https://i.pravatar.cc/150?img=45",
    age: 31,
    gender: "Female",
    phone: "+880 1812-200022",
    totalDonations: 6,
    lastDonation: "2026-06-20",
  },
  {
    id: "donor-003",
    name: "Shakil Rana",
    bloodGroup: "B+",
    area: "Uttara",
    address: "Sector 4, Uttara, Dhaka",
    photo: "https://i.pravatar.cc/150?img=13",
    age: 24,
    gender: "Male",
    phone: "+880 1913-300033",
    totalDonations: 3,
    lastDonation: "2026-05-01",
  },
  {
    id: "donor-004",
    name: "Nusrat Jahan",
    bloodGroup: "O-",
    area: "Mirpur",
    address: "Section 10, Mirpur, Dhaka",
    photo: "https://i.pravatar.cc/150?img=32",
    age: 29,
    gender: "Female",
    phone: "+880 1614-400044",
    totalDonations: 9,
    lastDonation: "2026-02-10",
  },
  {
    id: "donor-005",
    name: "Rakibul Hasan",
    bloodGroup: "AB+",
    area: "Banani",
    address: "Road 27, Banani, Dhaka",
    photo: "https://i.pravatar.cc/150?img=51",
    age: 35,
    gender: "Male",
    phone: "+880 1715-500055",
    totalDonations: 18,
    lastDonation: "2026-04-25",
  },
  {
    id: "donor-006",
    name: "Sabrina Kabir",
    bloodGroup: "A-",
    area: "Bashundhara",
    address: "Block D, Bashundhara R/A, Dhaka",
    photo: "https://i.pravatar.cc/150?img=48",
    age: 26,
    gender: "Female",
    phone: "+880 1816-600066",
    totalDonations: 4,
    lastDonation: "2026-06-01",
  },
  {
    id: "donor-007",
    name: "Mahfuzur Rahman",
    bloodGroup: "B-",
    area: "Mohakhali",
    address: "Wireless Gate, Mohakhali, Dhaka",
    photo: "https://i.pravatar.cc/150?img=14",
    age: 40,
    gender: "Male",
    phone: "+880 1917-700077",
    totalDonations: 22,
    lastDonation: "2026-01-18",
  },
  {
    id: "donor-008",
    name: "Ayesha Siddika",
    bloodGroup: "AB-",
    area: "Dhanmondi",
    address: "Road 15, Dhanmondi, Dhaka",
    photo: "https://i.pravatar.cc/150?img=44",
    age: 23,
    gender: "Female",
    phone: "+880 1618-800088",
    totalDonations: 2,
    lastDonation: "2026-06-25",
  },
  {
    id: "donor-009",
    name: "Imran Kabir",
    bloodGroup: "O+",
    area: "Gulshan",
    address: "Road 11, Gulshan, Dhaka",
    photo: "https://i.pravatar.cc/150?img=15",
    age: 33,
    gender: "Male",
    phone: "+880 1719-900099",
    totalDonations: 15,
    lastDonation: "2026-03-30",
  },
  {
    id: "donor-010",
    name: "Ruma Aktar",
    bloodGroup: "A+",
    area: "Uttara",
    address: "Sector 7, Uttara, Dhaka",
    photo: "https://i.pravatar.cc/150?img=47",
    age: 28,
    gender: "Female",
    phone: "+880 1610-101010",
    totalDonations: 7,
    lastDonation: "2026-05-15",
  },
];

export function getBloodDonorById(id: string) {
  return bloodDonors.find((d) => d.id === id);
}
