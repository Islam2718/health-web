export interface Hospital {
  id: string;
  name: string;
  type: string;
  area: string;
  address: string;
  image: string;
  rating: number;
  reviews: number;
  bedsAvailable: number;
  totalBeds: number;
  hasEmergency: boolean;
  hasAmbulance: boolean;
  established: number;
  phone: string;
  description: string;
  departments: string[];
  otRooms: number;
}

export const areas = [
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

export const hospitals: Hospital[] = [
  {
    id: "apollo-hospitals-dhaka",
    name: "Apollo Hospitals Dhaka",
    type: "Multi-Specialty Hospital",
    area: "Bashundhara",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
    image: "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=800&q=80",
    rating: 4.7,
    reviews: 1240,
    bedsAvailable: 42,
    totalBeds: 425,
    hasEmergency: true,
    hasAmbulance: true,
    established: 2005,
    phone: "+880 10678-747474",
    description:
      "A JCI-accredited tertiary care hospital offering cardiac care, oncology, neurosciences, and organ transplant services.",
    departments: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Nephrology", "Gastroenterology"],
    otRooms: 12,
  },
  {
    id: "square-hospital",
    name: "Square Hospital",
    type: "Private General Hospital",
    area: "Panthapath",
    address: "18/F West Panthapath, Dhaka",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    rating: 4.6,
    reviews: 980,
    bedsAvailable: 30,
    totalBeds: 350,
    hasEmergency: true,
    hasAmbulance: true,
    established: 2006,
    phone: "+880 10666-701700",
    description:
      "One of the leading private hospitals in Bangladesh with comprehensive diagnostic, surgical, and critical care services.",
    departments: ["Dermatology", "Gynecology", "General Surgery", "Pediatrics", "ENT", "Urology"],
    otRooms: 10,
  },
  {
    id: "united-hospital",
    name: "United Hospital",
    type: "Multi-Specialty Hospital",
    area: "Gulshan",
    address: "Plot 15, Road 71, Gulshan, Dhaka",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
    rating: 4.5,
    reviews: 856,
    bedsAvailable: 18,
    totalBeds: 500,
    hasEmergency: true,
    hasAmbulance: true,
    established: 2006,
    phone: "+880 10666-716000",
    description:
      "A JCI-accredited hospital known for pediatrics, cardiac sciences, and 24/7 emergency & trauma care.",
    departments: ["Pediatrics", "Cardiology", "Emergency Medicine", "Internal Medicine", "Radiology"],
    otRooms: 14,
  },
  {
    id: "labaid-specialized-hospital",
    name: "Labaid Specialized Hospital",
    type: "Specialized Hospital",
    area: "Dhanmondi",
    address: "House 1, Road 4, Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
    rating: 4.4,
    reviews: 612,
    bedsAvailable: 12,
    totalBeds: 220,
    hasEmergency: true,
    hasAmbulance: true,
    established: 1996,
    phone: "+880 2-9676356",
    description:
      "A specialized hospital focused on orthopedics, cardiac surgery, and advanced diagnostic imaging.",
    departments: ["Orthopedics", "Cardiac Surgery", "Radiology", "Physiotherapy"],
    otRooms: 6,
  },
  {
    id: "ibn-sina-diagnostic-consultation",
    name: "Ibn Sina Diagnostic & Consultation Centre",
    type: "Diagnostic & Consultation Centre",
    area: "Mirpur",
    address: "Kallyanpur, Mirpur Road, Dhaka",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
    rating: 4.5,
    reviews: 734,
    bedsAvailable: 8,
    totalBeds: 60,
    hasEmergency: false,
    hasAmbulance: true,
    established: 1980,
    phone: "+880 2-9008690",
    description:
      "A trusted diagnostic and outpatient consultation centre offering gynecology, general medicine, and lab services.",
    departments: ["Gynecology", "General Medicine", "Pathology", "Imaging"],
    otRooms: 2,
  },
  {
    id: "popular-diagnostic-centre",
    name: "Popular Diagnostic Centre",
    type: "Diagnostic Centre",
    area: "Dhanmondi",
    address: "House 16, Road 2, Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    rating: 4.3,
    reviews: 540,
    bedsAvailable: 5,
    totalBeds: 40,
    hasEmergency: false,
    hasAmbulance: false,
    established: 1983,
    phone: "+880 2-9611720",
    description:
      "A well-known diagnostic chain offering pathology, imaging, and specialist outpatient consultations.",
    departments: ["ENT", "Pathology", "Imaging", "General Medicine"],
    otRooms: 1,
  },
  {
    id: "mind-care-clinic",
    name: "Mind Care Clinic",
    type: "Specialized Clinic",
    area: "Banani",
    address: "Road 11, Banani, Dhaka",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
    rating: 4.8,
    reviews: 210,
    bedsAvailable: 6,
    totalBeds: 20,
    hasEmergency: false,
    hasAmbulance: false,
    established: 2014,
    phone: "+880 1711-223344",
    description:
      "A dedicated mental health clinic offering psychiatric consultations, counselling, and adolescent care.",
    departments: ["Psychiatry", "Counselling"],
    otRooms: 0,
  },
  {
    id: "smile-dental-care",
    name: "Smile Dental Care",
    type: "Dental Clinic",
    area: "Uttara",
    address: "Sector 7, Uttara, Dhaka",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
    rating: 4.6,
    reviews: 315,
    bedsAvailable: 0,
    totalBeds: 0,
    hasEmergency: false,
    hasAmbulance: false,
    established: 2011,
    phone: "+880 1911-556677",
    description:
      "A modern dental care facility offering general dentistry, cosmetic procedures, and orthodontics.",
    departments: ["Dentistry", "Orthodontics"],
    otRooms: 2,
  },
  {
    id: "ibnocare-community-clinic",
    name: "Ibnocare Community Clinic",
    type: "Community Clinic",
    area: "Mirpur",
    address: "Section 6, Mirpur, Dhaka",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    rating: 4.5,
    reviews: 190,
    bedsAvailable: 10,
    totalBeds: 25,
    hasEmergency: true,
    hasAmbulance: true,
    established: 2020,
    phone: "+880 1811-998877",
    description:
      "A community-focused primary care clinic providing affordable general checkups and preventive care.",
    departments: ["General Physician", "Pediatrics", "Vaccination"],
    otRooms: 1,
  },
  {
    id: "ibnocare-neuro-centre",
    name: "Ibnocare Neuro Centre",
    type: "Specialized Hospital",
    area: "Dhanmondi",
    address: "Road 27, Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
    rating: 4.7,
    reviews: 145,
    bedsAvailable: 14,
    totalBeds: 60,
    hasEmergency: true,
    hasAmbulance: true,
    established: 2016,
    phone: "+880 1711-887766",
    description:
      "A focused neuroscience centre providing stroke management, epilepsy care, and neuro-rehabilitation.",
    departments: ["Neurology", "Neurosurgery", "Rehabilitation"],
    otRooms: 4,
  },
];

export function getHospitalById(id: string) {
  return hospitals.find((h) => h.id === id);
}
