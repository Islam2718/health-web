export interface Ambulance {
  id: string;
  provider: string;
  type: string;
  area: string;
  vehicleNumber: string;
  status: "Available Now" | "En Route" | "On Duty";
  etaMinutes: number;
  rating: number;
  baseFare: number;
  equipment: string[];
  driver: {
    name: string;
    photo: string;
    phone: string;
    license: string;
    experience: number;
  };
}

export const ambulanceAreas = [
  "All Areas",
  "Dhanmondi",
  "Gulshan",
  "Uttara",
  "Mirpur",
  "Banani",
  "Bashundhara",
  "Mohakhali",
];

export const ambulances: Ambulance[] = [
  {
    id: "amb-001",
    provider: "Ibnocare Emergency Network",
    type: "Advanced Life Support (ICU)",
    area: "Bashundhara",
    vehicleNumber: "DHK-METRO-GA-11-2201",
    status: "Available Now",
    etaMinutes: 6,
    rating: 4.9,
    baseFare: 1500,
    equipment: ["Ventilator", "Defibrillator", "Oxygen Supply", "Cardiac Monitor"],
    driver: {
      name: "Mizanur Rahman",
      photo: "https://i.pravatar.cc/150?img=14",
      phone: "+880 1712-340011",
      license: "DL-DHK-880231",
      experience: 9,
    },
  },
  {
    id: "amb-002",
    provider: "Red Crescent Ambulance",
    type: "Basic Life Support",
    area: "Dhanmondi",
    vehicleNumber: "DHK-METRO-GA-09-5567",
    status: "Available Now",
    etaMinutes: 8,
    rating: 4.7,
    baseFare: 900,
    equipment: ["Oxygen Supply", "First Aid Kit", "Stretcher"],
    driver: {
      name: "Abdul Karim",
      photo: "https://i.pravatar.cc/150?img=53",
      phone: "+880 1812-556677",
      license: "DL-DHK-771942",
      experience: 12,
    },
  },
  {
    id: "amb-003",
    provider: "United Hospital Ambulance",
    type: "Advanced Life Support (ICU)",
    area: "Gulshan",
    vehicleNumber: "DHK-METRO-GA-14-8890",
    status: "En Route",
    etaMinutes: 14,
    rating: 4.8,
    baseFare: 1700,
    equipment: ["Ventilator", "Defibrillator", "Cardiac Monitor", "Oxygen Supply"],
    driver: {
      name: "Jasim Uddin",
      photo: "https://i.pravatar.cc/150?img=59",
      phone: "+880 1912-334455",
      license: "DL-DHK-660312",
      experience: 7,
    },
  },
  {
    id: "amb-004",
    provider: "City Ambulance Service",
    type: "Basic Life Support",
    area: "Mirpur",
    vehicleNumber: "DHK-METRO-GA-02-1123",
    status: "Available Now",
    etaMinutes: 5,
    rating: 4.5,
    baseFare: 800,
    equipment: ["Oxygen Supply", "Stretcher", "First Aid Kit"],
    driver: {
      name: "Nazrul Islam",
      photo: "https://i.pravatar.cc/150?img=33",
      phone: "+880 1611-778899",
      license: "DL-DHK-552091",
      experience: 5,
    },
  },
  {
    id: "amb-005",
    provider: "Square Hospital Ambulance",
    type: "Advanced Life Support (ICU)",
    area: "Panthapath",
    vehicleNumber: "DHK-METRO-GA-06-4432",
    status: "On Duty",
    etaMinutes: 20,
    rating: 4.8,
    baseFare: 1600,
    equipment: ["Ventilator", "Defibrillator", "Oxygen Supply"],
    driver: {
      name: "Shahidul Islam",
      photo: "https://i.pravatar.cc/150?img=68",
      phone: "+880 1511-990022",
      license: "DL-DHK-449812",
      experience: 10,
    },
  },
  {
    id: "amb-006",
    provider: "Ibnocare Emergency Network",
    type: "Neonatal Ambulance",
    area: "Banani",
    vehicleNumber: "DHK-METRO-GA-11-3391",
    status: "Available Now",
    etaMinutes: 9,
    rating: 4.9,
    baseFare: 1800,
    equipment: ["Infant Incubator", "Oxygen Supply", "Cardiac Monitor"],
    driver: {
      name: "Rafiqul Alam",
      photo: "https://i.pravatar.cc/150?img=15",
      phone: "+880 1712-887744",
      license: "DL-DHK-991023",
      experience: 8,
    },
  },
  {
    id: "amb-007",
    provider: "Red Crescent Ambulance",
    type: "Basic Life Support",
    area: "Uttara",
    vehicleNumber: "DHK-METRO-GA-10-7765",
    status: "Available Now",
    etaMinutes: 7,
    rating: 4.6,
    baseFare: 850,
    equipment: ["Oxygen Supply", "First Aid Kit", "Stretcher"],
    driver: {
      name: "Habibur Rahman",
      photo: "https://i.pravatar.cc/150?img=17",
      phone: "+880 1911-223300",
      license: "DL-DHK-334521",
      experience: 6,
    },
  },
  {
    id: "amb-008",
    provider: "City Ambulance Service",
    type: "Freezer / Mortuary Van",
    area: "Mohakhali",
    vehicleNumber: "DHK-METRO-GA-03-9981",
    status: "On Duty",
    etaMinutes: 25,
    rating: 4.4,
    baseFare: 2000,
    equipment: ["Cold Storage Unit", "Stretcher"],
    driver: {
      name: "Anwar Hossain",
      photo: "https://i.pravatar.cc/150?img=6",
      phone: "+880 1611-556600",
      license: "DL-DHK-118823",
      experience: 11,
    },
  },
];

export function getAmbulanceById(id: string) {
  return ambulances.find((a) => a.id === id);
}
