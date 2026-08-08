export interface DiagnosticTest {
  name: string;
  price: number;
  duration: string;
}

export interface DiagnosticCenter {
  id: string;
  name: string;
  type: string;
  area: string;
  address: string;
  image: string;
  rating: number;
  reviews: number;
  homeSampleCollection: boolean;
  reportDelivery: string;
  openHours: string;
  phone: string;
  description: string;
  categories: string[];
  tests: DiagnosticTest[];
}

export const diagnosticAreas = [
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

export const diagnosticCenters: DiagnosticCenter[] = [
  {
    id: "popular-diagnostic-dhanmondi",
    name: "Popular Diagnostic Centre",
    type: "Diagnostic & Imaging Centre",
    area: "Dhanmondi",
    address: "House 16, Road 2, Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=800&q=80",
    rating: 4.6,
    reviews: 892,
    homeSampleCollection: true,
    reportDelivery: "Same day",
    openHours: "7:00 AM – 10:00 PM",
    phone: "+880 2-9611720",
    description:
      "A full-service diagnostic chain offering pathology, radiology, and cardiac diagnostic services with rapid report turnaround.",
    categories: ["Pathology", "Radiology", "Cardiology"],
    tests: [
      { name: "Complete Blood Count (CBC)", price: 400, duration: "Same day" },
      { name: "Chest X-Ray", price: 600, duration: "Same day" },
      { name: "ECG", price: 500, duration: "30 min" },
      { name: "Lipid Profile", price: 1200, duration: "Same day" },
      { name: "Ultrasound (Abdomen)", price: 1500, duration: "Same day" },
    ],
  },
  {
    id: "ibn-sina-diagnostic-mirpur",
    name: "Ibn Sina Diagnostic & Consultation Centre",
    type: "Diagnostic & Consultation Centre",
    area: "Mirpur",
    address: "Kallyanpur, Mirpur Road, Dhaka",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    rating: 4.5,
    reviews: 734,
    homeSampleCollection: true,
    reportDelivery: "Within 24 hours",
    openHours: "8:00 AM – 9:00 PM",
    phone: "+880 2-9008690",
    description:
      "A trusted community diagnostic centre offering routine lab tests, imaging, and outpatient consultations under one roof.",
    categories: ["Pathology", "Radiology", "General Medicine"],
    tests: [
      { name: "Complete Blood Count (CBC)", price: 350, duration: "Same day" },
      { name: "Blood Glucose (Fasting)", price: 150, duration: "Same day" },
      { name: "Urine R/E", price: 250, duration: "Same day" },
      { name: "X-Ray (Chest)", price: 550, duration: "Same day" },
    ],
  },
  {
    id: "labaid-diagnostic-dhanmondi",
    name: "Labaid Diagnostic",
    type: "Advanced Imaging & Pathology",
    area: "Dhanmondi",
    address: "House 1, Road 4, Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
    rating: 4.7,
    reviews: 1105,
    homeSampleCollection: true,
    reportDelivery: "Within 24 hours",
    openHours: "24 hours",
    phone: "+880 2-9676356",
    description:
      "Advanced diagnostic imaging including MRI, CT scan, and a full pathology lab with 24/7 emergency test support.",
    categories: ["Radiology", "Pathology", "Cardiology"],
    tests: [
      { name: "MRI (Brain)", price: 9500, duration: "Within 24 hrs" },
      { name: "CT Scan (Chest)", price: 6500, duration: "Within 24 hrs" },
      { name: "Echocardiogram", price: 2500, duration: "Same day" },
      { name: "Complete Blood Count (CBC)", price: 400, duration: "Same day" },
      { name: "Thyroid Profile (T3, T4, TSH)", price: 1400, duration: "Same day" },
    ],
  },
  {
    id: "united-diagnostic-gulshan",
    name: "United Diagnostic Centre",
    type: "Diagnostic Centre",
    area: "Gulshan",
    address: "Plot 15, Road 71, Gulshan, Dhaka",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    rating: 4.5,
    reviews: 540,
    homeSampleCollection: false,
    reportDelivery: "Same day",
    openHours: "7:00 AM – 8:00 PM",
    phone: "+880 2-8836000",
    description:
      "Hospital-affiliated diagnostic wing offering precise lab testing and imaging backed by United Hospital's specialists.",
    categories: ["Pathology", "Radiology"],
    tests: [
      { name: "Complete Blood Count (CBC)", price: 450, duration: "Same day" },
      { name: "Liver Function Test", price: 1100, duration: "Same day" },
      { name: "Ultrasound (Pelvis)", price: 1600, duration: "Same day" },
    ],
  },
  {
    id: "square-diagnostic-panthapath",
    name: "Square Diagnostic Centre",
    type: "Diagnostic & Imaging Centre",
    area: "Panthapath",
    address: "18/F West Panthapath, Dhaka",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
    rating: 4.6,
    reviews: 678,
    homeSampleCollection: true,
    reportDelivery: "Same day",
    openHours: "7:00 AM – 11:00 PM",
    phone: "+880 2-9666710",
    description:
      "A leading private diagnostic centre offering comprehensive lab, cardiac, and imaging services with online report access.",
    categories: ["Pathology", "Cardiology", "Radiology"],
    tests: [
      { name: "Complete Blood Count (CBC)", price: 420, duration: "Same day" },
      { name: "ECG", price: 500, duration: "30 min" },
      { name: "Chest X-Ray", price: 600, duration: "Same day" },
      { name: "HbA1c", price: 900, duration: "Same day" },
    ],
  },
  {
    id: "ibnocare-labs-bashundhara",
    name: "Ibnocare Labs",
    type: "Pathology Lab",
    area: "Bashundhara",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
    image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&q=80",
    rating: 4.8,
    reviews: 312,
    homeSampleCollection: true,
    reportDelivery: "Within 12 hours",
    openHours: "6:00 AM – 10:00 PM",
    phone: "+880 10678-747400",
    description:
      "Ibnocare's own network lab offering fast, accurate pathology testing with home sample pickup across the city.",
    categories: ["Pathology"],
    tests: [
      { name: "Complete Blood Count (CBC)", price: 380, duration: "Within 12 hrs" },
      { name: "Blood Glucose (Random)", price: 120, duration: "Within 12 hrs" },
      { name: "Lipid Profile", price: 1100, duration: "Within 12 hrs" },
      { name: "Vitamin D", price: 1800, duration: "Within 24 hrs" },
    ],
  },
  {
    id: "apollo-diagnostic-bashundhara",
    name: "Apollo Diagnostic Wing",
    type: "Advanced Imaging & Pathology",
    area: "Bashundhara",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    rating: 4.7,
    reviews: 950,
    homeSampleCollection: true,
    reportDelivery: "Within 24 hours",
    openHours: "24 hours",
    phone: "+880 10678-747474",
    description:
      "JCI-accredited diagnostic wing offering the full spectrum of imaging, cardiac testing, and specialized lab panels.",
    categories: ["Radiology", "Cardiology", "Pathology"],
    tests: [
      { name: "MRI (Spine)", price: 10500, duration: "Within 24 hrs" },
      { name: "CT Scan (Abdomen)", price: 7000, duration: "Within 24 hrs" },
      { name: "Echocardiogram", price: 2800, duration: "Same day" },
      { name: "Complete Blood Count (CBC)", price: 450, duration: "Same day" },
    ],
  },
  {
    id: "mohakhali-medical-diagnostic",
    name: "Mohakhali Medical Diagnostic Centre",
    type: "Diagnostic Centre",
    area: "Mohakhali",
    address: "Mohakhali Wireless Gate, Dhaka",
    image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80",
    rating: 4.3,
    reviews: 265,
    homeSampleCollection: false,
    reportDelivery: "Within 24 hours",
    openHours: "8:00 AM – 8:00 PM",
    phone: "+880 1911-334455",
    description:
      "An affordable neighborhood diagnostic centre offering essential pathology and X-ray services for everyday care.",
    categories: ["Pathology", "Radiology"],
    tests: [
      { name: "Complete Blood Count (CBC)", price: 300, duration: "Same day" },
      { name: "Blood Glucose (Fasting)", price: 100, duration: "Same day" },
      { name: "X-Ray (Chest)", price: 500, duration: "Same day" },
    ],
  },
];

export function getDiagnosticCenterById(id: string) {
  return diagnosticCenters.find((d) => d.id === id);
}
