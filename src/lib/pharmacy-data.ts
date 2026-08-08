export interface Medicine {
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  requiresPrescription: boolean;
}

export interface MedicalStore {
  id: string;
  name: string;
  type: string;
  area: string;
  address: string;
  image: string;
  rating: number;
  reviews: number;
  deliveryAvailable: boolean;
  deliveryTime: string;
  openHours: string;
  phone: string;
  description: string;
  categories: string[];
  medicines: Medicine[];
}

export const pharmacyAreas = [
  "All Areas",
  "Dhanmondi",
  "Gulshan",
  "Uttara",
  "Mirpur",
  "Banani",
  "Bashundhara",
  "Panthapath",
  "Mohakhali",
];

export const medicalStores: MedicalStore[] = [
  {
    id: "lazz-pharma-dhanmondi",
    name: "Lazz Pharma",
    type: "Retail Pharmacy",
    area: "Dhanmondi",
    address: "House 5, Road 27, Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    rating: 4.6,
    reviews: 420,
    deliveryAvailable: true,
    deliveryTime: "30–45 min",
    openHours: "24 hours",
    phone: "+880 1711-223300",
    description:
      "A 24-hour retail pharmacy stocking prescription medicines, OTC drugs, and everyday healthcare essentials.",
    categories: ["Prescription", "OTC", "Baby Care", "Personal Care"],
    medicines: [
      { name: "Napa Extra (20 tabs)", category: "Pain Relief", price: 30, inStock: true, requiresPrescription: false },
      { name: "Seclo 20mg (14 caps)", category: "Gastric", price: 84, inStock: true, requiresPrescription: false },
      { name: "Amoxicillin 500mg (10 caps)", category: "Antibiotic", price: 60, inStock: true, requiresPrescription: true },
      { name: "Vitamin D3 1000IU (30 tabs)", category: "Supplements", price: 250, inStock: true, requiresPrescription: false },
    ],
  },
  {
    id: "medipoint-pharmacy-gulshan",
    name: "MediPoint Pharmacy",
    type: "Retail Pharmacy",
    area: "Gulshan",
    address: "Road 71, Gulshan, Dhaka",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80",
    rating: 4.7,
    reviews: 356,
    deliveryAvailable: true,
    deliveryTime: "20–30 min",
    openHours: "8:00 AM – 12:00 AM",
    phone: "+880 1811-556677",
    description:
      "A premium pharmacy offering genuine medicines, imported supplements, and quick doorstep delivery across Gulshan.",
    categories: ["Prescription", "OTC", "Supplements"],
    medicines: [
      { name: "Napa 500mg (20 tabs)", category: "Pain Relief", price: 20, inStock: true, requiresPrescription: false },
      { name: "Losectil 20mg (14 caps)", category: "Gastric", price: 98, inStock: true, requiresPrescription: false },
      { name: "Metformin 500mg (30 tabs)", category: "Diabetes", price: 45, inStock: true, requiresPrescription: true },
      { name: "Multivitamin (30 tabs)", category: "Supplements", price: 320, inStock: false, requiresPrescription: false },
    ],
  },
  {
    id: "popular-pharmacy-mirpur",
    name: "Popular Pharmacy",
    type: "Retail Pharmacy",
    area: "Mirpur",
    address: "Section 6, Mirpur, Dhaka",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80",
    rating: 4.4,
    reviews: 210,
    deliveryAvailable: true,
    deliveryTime: "40–60 min",
    openHours: "7:00 AM – 11:00 PM",
    phone: "+880 1911-778899",
    description:
      "A community pharmacy chain offering affordable generic medicines and free health screening camps.",
    categories: ["Prescription", "OTC", "Baby Care"],
    medicines: [
      { name: "Napa Extra (20 tabs)", category: "Pain Relief", price: 28, inStock: true, requiresPrescription: false },
      { name: "Ceevit 500mg (10 tabs)", category: "Supplements", price: 15, inStock: true, requiresPrescription: false },
      { name: "Azithromycin 500mg (3 tabs)", category: "Antibiotic", price: 90, inStock: true, requiresPrescription: true },
    ],
  },
  {
    id: "ibnocare-pharmacy-bashundhara",
    name: "Ibnocare Pharmacy",
    type: "Ibnocare Partner Pharmacy",
    area: "Bashundhara",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80",
    rating: 4.9,
    reviews: 188,
    deliveryAvailable: true,
    deliveryTime: "25–35 min",
    openHours: "24 hours",
    phone: "+880 10678-747411",
    description:
      "Ibnocare's own verified pharmacy partner offering direct prescription fulfillment straight from your doctor's visit.",
    categories: ["Prescription", "OTC", "Supplements", "Personal Care"],
    medicines: [
      { name: "Napa 500mg (20 tabs)", category: "Pain Relief", price: 20, inStock: true, requiresPrescription: false },
      { name: "Seclo 20mg (14 caps)", category: "Gastric", price: 84, inStock: true, requiresPrescription: false },
      { name: "Atorvastatin 10mg (30 tabs)", category: "Cardiac", price: 210, inStock: true, requiresPrescription: true },
      { name: "ORSaline (10 sachets)", category: "OTC", price: 25, inStock: true, requiresPrescription: false },
      { name: "Vitamin D3 1000IU (30 tabs)", category: "Supplements", price: 250, inStock: true, requiresPrescription: false },
    ],
  },
  {
    id: "well-care-pharmacy-uttara",
    name: "WellCare Pharmacy",
    type: "Retail Pharmacy",
    area: "Uttara",
    address: "Sector 7, Uttara, Dhaka",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    rating: 4.5,
    reviews: 264,
    deliveryAvailable: true,
    deliveryTime: "30–50 min",
    openHours: "8:00 AM – 11:00 PM",
    phone: "+880 1611-889900",
    description:
      "A neighborhood pharmacy with a wide range of prescription medicines and personal care products.",
    categories: ["Prescription", "OTC", "Personal Care"],
    medicines: [
      { name: "Napa Extra (20 tabs)", category: "Pain Relief", price: 30, inStock: true, requiresPrescription: false },
      { name: "Cetirizine 10mg (10 tabs)", category: "Allergy", price: 12, inStock: true, requiresPrescription: false },
      { name: "Omeprazole 20mg (14 caps)", category: "Gastric", price: 70, inStock: false, requiresPrescription: false },
    ],
  },
  {
    id: "central-medical-store-banani",
    name: "Central Medical Store",
    type: "Retail Pharmacy",
    area: "Banani",
    address: "Road 11, Banani, Dhaka",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&q=80",
    rating: 4.3,
    reviews: 145,
    deliveryAvailable: false,
    deliveryTime: "In-store pickup only",
    openHours: "9:00 AM – 10:00 PM",
    phone: "+880 1711-990011",
    description:
      "A long-standing neighborhood pharmacy known for stocking hard-to-find imported medicines.",
    categories: ["Prescription", "OTC"],
    medicines: [
      { name: "Napa 500mg (20 tabs)", category: "Pain Relief", price: 20, inStock: true, requiresPrescription: false },
      { name: "Insulin Glargine (1 pen)", category: "Diabetes", price: 950, inStock: true, requiresPrescription: true },
    ],
  },
];

export function getMedicalStoreById(id: string) {
  return medicalStores.find((s) => s.id === id);
}
