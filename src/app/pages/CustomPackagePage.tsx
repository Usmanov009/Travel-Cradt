import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/LoginModal";
import { motion } from "motion/react";
import { PACKAGE_MEDIA } from "../data/packageMedia";
import { PackageImage } from "../components/PackageImage";
import { PackageCard } from "../components/PackageCard";
import { AiComboBanner } from "../components/AiComboBanner";
import { DestinationMap } from "../components/DestinationMap";
import { usePackages } from "../hooks/usePackages";
import type { PackageType, TravelPackage } from "../data/packages";
import {
  getMinBookableDateString,
  isDateBookable,
  bookingDateError,
} from "../utils/bookingDates";
import { calculateCustomPrice } from "../utils/pricing";
import { recommendComboTours } from "../utils/comboTours";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Hotel,
  Car,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Utensils,
  Navigation,
  Download,
  Plane,
  Bus,
  Train,
  Star,
  Landmark,
  TreePine,
  Waves,
  Palette,
  ShoppingBag,
  Camera,
  Moon,
  Building2,
  Lock,
  Building,
} from "lucide-react";

export function CustomPackagePage() {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [planSelected, setPlanSelected] = useState(false);
  const [userCity, setUserCity] = useState<string>("");

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/places/geocode?q=${encodeURIComponent(`${pos.coords.latitude},${pos.coords.longitude}`)}`
          );
          const data = await res.json();
          if (data.displayName) {
            setUserCity(data.displayName.split(",").slice(0, 2).join(", "));
          }
        } catch (_) {}
      },
      () => {}
    );
  }, []);

  const [showResults, setShowResults] = useState(false);
  const [dateError, setDateError] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const minBookableDate = getMinBookableDateString();

  type DestInfo = {
    highlights: string[];
    bestTime: string;
    prices: { budget: string; midRange: string; luxury: string };
    tip: string;
  };
  const [destInfo, setDestInfo] = useState<DestInfo | null>(null);
  const [destInfoLoading, setDestInfoLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    destinationType: "",
    selectedCountry: "",
    startDate: "",
    endDate: "",
    days: 3,
    travelers: 2,
    budget: "",
    hotelType: "",
    transport: "",
    interests: [] as string[],
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (formData.selectedCountry === "uzbekistan") {
      setFormData((prev) => ({ ...prev, destinationType: "domestic" }));
    } else if (formData.selectedCountry) {
      setFormData((prev) => ({ ...prev, destinationType: "international" }));
    }
  }, [formData.selectedCountry]);

  const { packages: matchPackages, loading: matchesLoading } = usePackages(
    formData.destinationType ? (formData.destinationType as PackageType) : undefined
  );

  type DestinationData = {
    key: string;
    name: string;
    country: string;
    description: string;
    images: string[];
  };

  const destinationCatalog: DestinationData[] = [
    {
      key: "samarkand",
      name: "Samarkand",
      country: "Uzbekistan",
      description: "Historic Silk Road city with beautiful madrasas and ancient monuments.",
      images: [
        "https://images.unsplash.com/photo-1596847613777-18ae8d1bd8f5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "bukhara",
      name: "Bukhara",
      country: "Uzbekistan",
      description: "Ancient city full of madrasas, bazaars and historical charm.",
      images: [
        "https://images.unsplash.com/photo-1511485977113-f5d8f4a4f6ef?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1510276976340-43f26af4ec4b?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "dubai",
      name: "Dubai",
      country: "UAE",
      description: "Modern metropolis with luxury hotels, desert safaris and sky-high views.",
      images: [
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "thailand",
      name: "Thailand",
      country: "Thailand",
      description: "Tropical beaches, vibrant culture and unforgettable food.",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "santorini",
      name: "Santorini",
      country: "Greece",
      description: "Iconic sunsets, white cliffs and magical island beaches.",
      images: [
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "bishkek",
      name: "Bishkek",
      country: "Qirg'iziston",
      description: "Alpine city with Soviet architecture and vibrant bazaars.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "osh",
      name: "Osh",
      country: "Qirg'iziston",
      description: "Ancient trading city at the crossroads of the Silk Road.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "karakol",
      name: "Karakol",
      country: "Qirg'iziston",
      description: "Gateway to Issyk-Kul with stunning mountain scenery.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "almaty",
      name: "Almaty",
      country: "Qozog'iston",
      description: "Cosmopolitan hub surrounded by the Tien Shan mountains.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "astana",
      name: "Astana",
      country: "Qozog'iston",
      description: "Futuristic capital with striking architecture and wide avenues.",
      images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"],
    },
    {
      key: "shymkent",
      name: "Shymkent",
      country: "Qozog'iston",
      description: "Cultural melting pot with rich history and cuisine.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "turkistan",
      name: "Turkistan",
      country: "Qozog'iston",
      description: "Historic Silk Road city with the iconic Mausoleum of Khoja Ahmed Yasawi.",
      images: ["https://images.unsplash.com/photo-1596847613777-18ae8d1bd8f5?w=800&h=600&fit=crop"],
    },
    {
      key: "dushanbe",
      name: "Dushanbe",
      country: "Tojikiston",
      description: "Picturesque capital framed by mountains and parks.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "khujand",
      name: "Khujand",
      country: "Tojikiston",
      description: "Ancient city on the Silk Road with a bustling bazaar.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "moscow",
      name: "Moscow",
      country: "Rossiya",
      description: "Grand capital with iconic Red Square and rich cultural heritage.",
      images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"],
    },
    {
      key: "st-petersburg",
      name: "St. Petersburg",
      country: "Rossiya",
      description: "Elegant imperial city of canals, palaces and world-class museums.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "sochi",
      name: "Sochi",
      country: "Rossiya",
      description: "Black Sea resort with subtropical climate and mountain views.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "kazan",
      name: "Kazan",
      country: "Rossiya",
      description: "Historic Tatar capital blending East and West.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "minsk",
      name: "Minsk",
      country: "Belarus",
      description: "Vibrant capital with Soviet-era architecture and green spaces.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "baku",
      name: "Baku",
      country: "Ozarbayjon",
      description: "Futuristic city on the Caspian Sea with ancient Old City.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "yerevan",
      name: "Yerevan",
      country: "Armaniston",
      description: "Pink-stone capital with ancient history and vibrant cafe culture.",
      images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"],
    },
    {
      key: "tbilisi",
      name: "Tbilisi",
      country: "Gruziya",
      description: "Charming capital with thermal baths and medieval architecture.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "batumi",
      name: "Batumi",
      country: "Gruziya",
      description: "Lively Black Sea port with botanical gardens and modern architecture.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "kiev",
      name: "Kiev",
      country: "Ukraina",
      description: "Historic capital with golden-domed churches and vibrant street life.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "istanbul",
      name: "Istanbul",
      country: "Turkiya",
      description: "Where East meets West — historic mosques, bazaars and Bosphorus views.",
      images: ["https://images.unsplash.com/photo-1596847613777-18ae8d1bd8f5?w=800&h=600&fit=crop"],
    },
    {
      key: "antalya",
      name: "Antalya",
      country: "Turkiya",
      description: "Mediterranean gem with ancient ruins and turquoise coast.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "cappadocia",
      name: "Cappadocia",
      country: "Turkiya",
      description: "Surreal fairy chimneys and unforgettable hot-air balloon rides.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "bangkok",
      name: "Bangkok",
      country: "Tailand",
      description: "Vibrant capital with golden temples and bustling street food.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "phuket",
      name: "Phuket",
      country: "Tailand",
      description: "Thailand's largest island with pristine beaches and nightlife.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "dubai-uae",
      name: "Dubai",
      country: "BAA",
      description: "Futuristic metropolis with record-breaking skyscrapers and luxury.",
      images: [
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "abu-dhabi",
      name: "Abu Dhabi",
      country: "BAA",
      description: "Elegant capital with grand mosques and cultural landmarks.",
      images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"],
    },
    {
      key: "beijing",
      name: "Beijing",
      country: "Xitoy",
      description: "Ancient capital with the Great Wall, Forbidden City and imperial heritage.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "shanghai",
      name: "Shanghai",
      country: "Xitoy",
      description: "Cosmopolitan port city with futuristic skyline and colonial architecture.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "kuala-lumpur",
      name: "Kuala Lumpur",
      country: "Malayziya",
      description: "Dynamic capital with iconic Petronas Towers and street food.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "penang",
      name: "Penang",
      country: "Malayziya",
      description: "Cultural island with UNESCO heritage, street art and amazing food.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "muscat",
      name: "Muscat",
      country: "Ummon",
      description: "Picturesque sultanate with whitewashed buildings and desert backdrops.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "amman",
      name: "Amman",
      country: "Iordaniya",
      description: "Ancient capital with Roman theater and vibrant modern life.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "petra",
      name: "Petra",
      country: "Iordaniya",
      description: "Rose-red city carved into cliffs, one of the New Seven Wonders.",
      images: ["https://images.unsplash.com/photo-1596847613777-18ae8d1bd8f5?w=800&h=600&fit=crop"],
    },
    {
      key: "tehran",
      name: "Tehran",
      country: "Eron",
      description: "Lively capital at the foot of the Alborz mountains.",
      images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"],
    },
    {
      key: "isfahan",
      name: "Isfahan",
      country: "Eron",
      description: "Half the world — stunning Islamic architecture and grand squares.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "ulaanbaatar",
      name: "Ulaanbaatar",
      country: "Mo'g'uliston",
      description: "Nomadic capital blending monasteries and modern city life.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "manila",
      name: "Manila",
      country: "Filippin",
      description: "Bustling capital with Spanish colonial history and vibrant culture.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "cebu",
      name: "Cebu",
      country: "Filippin",
      description: "Island paradise with white sands, whale sharks and historic churches.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "palawan",
      name: "Palawan",
      country: "Filippin",
      description: "Pristine archipelago with lagoons and limestone cliffs.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "boracay",
      name: "Boracay",
      country: "Filippin",
      description: "World-famous beach island with powdery white sand.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "shiraz",
      name: "Shiraz",
      country: "Eron",
      description: "City of poets, gardens and ancient Persepolis nearby.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "kuala-lumpur",
      name: "Kuala Lumpur",
      country: "Malayziya",
      description: "Dynamic capital with iconic Petronas Towers and street food.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "penang",
      name: "Penang",
      country: "Malayziya",
      description: "Cultural island with UNESCO heritage, street art and amazing food.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "pattaya",
      name: "Pattaya",
      country: "Tailand",
      description: "Lively beach resort with water sports and nightlife.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "chiang-mai",
      name: "Chiang Mai",
      country: "Tailand",
      description: "Cultural heartland with temples, mountains and elephant sanctuaries.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "hong-kong",
      name: "Hong Kong",
      country: "Xitoy",
      description: "Vibrant harbor city where East meets West.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "macau",
      name: "Macau",
      country: "Makao",
      description: "Las Vegas of the East with Portuguese heritage and casinos.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "xian",
      name: "Xi'an",
      country: "Xitoy",
      description: "Ancient capital and starting point of the Silk Road with the Terracotta Army.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "sharjah",
      name: "Sharjah",
      country: "BAA",
      description: "Cultural capital with museums, souks and heritage districts.",
      images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"],
    },
    {
      key: "salalah",
      name: "Salalah",
      country: "Ummon",
      description: "Green monsoon city with frankincense history and beaches.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "wadi-rum",
      name: "Wadi Rum",
      country: "Iordaniya",
      description: "Mars-like desert valley perfect for stargazing and jeep tours.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "aqaba",
      name: "Aqaba",
      country: "Iordaniya",
      description: "Red Sea resort with coral reefs and water sports.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "gobi",
      name: "Gobi Desert",
      country: "Mo'g'uliston",
      description: "Vast desert with singing dunes and dinosaur fossils.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "nairobi",
      name: "Nairobi",
      country: "Keniya",
      description: "Safari gateway with national park and vibrant city life.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "mombasa",
      name: "Mombasa",
      country: "Keniya",
      description: "Historic coastal town with Swahili culture and beautiful beaches.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "male",
      name: "Male",
      country: "Maldiv orollari",
      description: "Capital atoll with colorful coral homes and clear waters.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "riyadh",
      name: "Riyadh",
      country: "Saudiya Arabistoni",
      description: "Modern desert capital with heritage sites and luxury.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "bali",
      name: "Bali",
      country: "Indoneziya / Bali",
      description: "Island of gods with rice terraces, temples and surf.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "jakarta",
      name: "Jakarta",
      country: "Indoneziya / Bali",
      description: "Bustling capital with a mix of colonial history and modern life.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "phnom-penh",
      name: "Phnom Penh",
      country: "Kambodja",
      description: "Riverside capital with royal palace and tragic history.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "siem-reap",
      name: "Siem Reap",
      country: "Kambodja",
      description: "Gateway to the magnificent Angkor Wat temples.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "vientiane",
      name: "Vientiane",
      country: "Laos",
      description: "Laid-back capital on the Mekong with French colonial architecture.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "beirut",
      name: "Beirut",
      country: "Livan",
      description: "Mediterranean city with vibrant nightlife and ancient ruins.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "kathmandu",
      name: "Kathmandu",
      country: "Nepal",
      description: "Historic valley city with temples and mountain gateway.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "cairo",
      name: "Cairo",
      country: "Misr",
      description: "City of a thousand minarets and gateway to the Pyramids.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "luxor",
      name: "Luxor",
      country: "Misr",
      description: "Open-air museum with Karnak Temple and Valley of the Kings.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "sharm-el-sheikh",
      name: "Sharm El-Sheikh",
      country: "Misr",
      description: "Red Sea resort with world-class diving and Sinai desert.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "mashhad",
      name: "Mashhad",
      country: "Eron",
      description: "Holy city with magnificent shrine and pilgrim destination.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "langkawi",
      name: "Langkawi",
      country: "Malayziya",
      description: "Tropical archipelago with mangrove forests and cable car rides.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "borneo",
      name: "Borneo",
      country: "Malayziya",
      description: "Wild island with rainforests, orangutans and Mount Kinabalu.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "gobi-desert",
      name: "Gobi Desert",
      country: "Mo'g'uliston",
      description: "Vast desert with singing dunes and dinosaur fossils.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "khuvsgul",
      name: "Khuvsgul",
      country: "Mo'g'uliston",
      description: "Asia's second-deepest lake surrounded by taiga and reindeer.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "st-johns",
      name: "St. John's",
      country: "Antigua va Barbuda",
      description: "Colorful harbour city with English Harbour history.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "bridgetown",
      name: "Bridgetown",
      country: "Barbados",
      description: "Capital with British colonial architecture and Caribbean beaches.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "roseau",
      name: "Roseau",
      country: "Dominika",
      description: "Tropical capital between mountains and Caribbean Sea.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "port-au-prince",
      name: "Port-au-Prince",
      country: "Gaiti",
      description: "Vibrant capital with colorful tap-taps and historic landmarks.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "kingstown",
      name: "Kingstown",
      country: "Sent-Vinsent va Grenadin",
      description: "Charming port town with volcanic black-sand beaches.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "pohnpei",
      name: "Pohnpei",
      country: "Mikroneziya",
      description: "Lush island with ancient Nan Madol ruins and heavy rainfall.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "paramaribo",
      name: "Paramaribo",
      country: "Surinam",
      description: "Colonial wooden capital with diverse cultures and rainforest.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "maafushi",
      name: "Maafushi",
      country: "Maldiv orollari",
      description: "Local island with budget guesthouses and crystal lagoons.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "jeddah",
      name: "Jeddah",
      country: "Saudiya Arabistoni",
      description: "Gateway to Mecca with historic Al-Balad and Red Sea coast.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "yogyakarta",
      name: "Yogyakarta",
      country: "Indoneziya / Bali",
      description: "Cultural heart of Java with Borobudur and royal palace.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "lombok",
      name: "Lombok",
      country: "Indoneziya / Bali",
      description: "Tropical island with Mount Rinjani and untouched beaches.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "sihanoukville",
      name: "Sihanoukville",
      country: "Kambodja",
      description: "Coastal resort with islands and nightlife.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "luang-prabang",
      name: "Luang Prabang",
      country: "Laos",
      description: "UNESCO town with golden temples and mountain backdrop.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "byblos",
      name: "Byblos",
      country: "Livan",
      description: "One of the oldest continuously inhabited cities with a medieval port.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "pokhara",
      name: "Pokhara",
      country: "Nepal",
      description: "Lakeside city with Annapurna mountain views.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "praia",
      name: "Praia",
      country: "Kabo-Verde",
      description: "Capital on volcanic Santiago with Creole culture and beaches.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "moroni",
      name: "Moroni",
      country: "Komor orollari",
      description: "Charming capital with ancient medina and vanilla plantations.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "antananarivo",
      name: "Antananarivo",
      country: "Madagaskar",
      description: "Hilltop capital with royal palaces and unique wildlife.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "port-louis",
      name: "Port Louis",
      country: "Mavrikiy",
      description: "Cosmopolitan capital with Caudan waterfront and Indian influence.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "maputo",
      name: "Maputo",
      country: "Mozambik",
      description: "Vibrant port city with Portuguese architecture and island life.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "koror",
      name: "Koror",
      country: "Palau",
      description: "Main island with WWII history and world-class diving.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "apia",
      name: "Apia",
      country: "Samoa",
      description: "Polynesian capital with waterfalls and traditional culture.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "harare",
      name: "Harare",
      country: "Zimbabve",
      description: "Garden city with modern art, wildlife and mountain views.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "hanoi",
      name: "Hanoi",
      country: "Vyetnam",
      description: "Ancient capital with French colonial lanes and vibrant street food.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "ho-chi-minh",
      name: "Ho Chi Minh",
      country: "Vyetnam",
      description: "Bustling southern hub with war history and rooftop bars.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "delhi",
      name: "Delhi",
      country: "Hindiston",
      description: "Historic capital with Mughal monuments and chaotic charm.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "mumbai",
      name: "Mumbai",
      country: "Hindiston",
      description: "Financial capital with Bollywood, colonial architecture and beaches.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "doha",
      name: "Doha",
      country: "Qatar",
      description: "Modern peninsula city with futuristic skyline and souqs.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "colombo",
      name: "Colombo",
      country: "Shri-Lanka",
      description: "Coastal capital with colonial forts, temples and street food.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "kandy",
      name: "Kandy",
      country: "Shri-Lanka",
      description: "Hill capital with sacred tooth temple and lush botanic gardens.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "galle",
      name: "Galle",
      country: "Shri-Lanka",
      description: "UNESCO fort city on the southern coast with colonial charm.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "chisinau",
      name: "Chisinau",
      country: "Moldova",
      description: "Wine capital with leafy parks and Soviet-era architecture.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "brest",
      name: "Brest",
      country: "Belarus",
      description: "Historic fortress city on the Bug River.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "ganja",
      name: "Ganja",
      country: "Ozarbayjon",
      description: "Cultural city with ancient mausoleums and green parks.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "gyumri",
      name: "Gyumri",
      country: "Armaniston",
      description: "Artsy city with black tuff architecture and folk music.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "kutaisi",
      name: "Kutaisi",
      country: "Gruziya",
      description: "Ancient capital with UNESCO monasteries nearby.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "lviv",
      name: "Lviv",
      country: "Ukraina",
      description: "Coffee capital with cobblestones and Habsburg heritage.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "izmir",
      name: "Izmir",
      country: "Turkiya",
      description: "Aegean port city with ancient Agora and seafood.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "ankara",
      name: "Ankara",
      country: "Turkiya",
      description: "Modern capital with Roman theater and Anıtkabir mausoleum.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "maasai-mara",
      name: "Maasai Mara",
      country: "Keniya",
      description: "World-famous reserve for the Great Migration and Big Five.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "baa-atoll",
      name: "Baa Atoll",
      country: "Maldiv orollari",
      description: "UNESCO biosphere reserve with luxury water villas.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "mecca",
      name: "Mecca",
      country: "Saudiya Arabistoni",
      description: "Islam's holiest city surrounding the Grand Mosque.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "medina",
      name: "Medina",
      country: "Saudiya Arabistoni",
      description: "Prophet's Mosque city with ancient walls and souqs.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "hoi-an",
      name: "Hoi An",
      country: "Vyetnam",
      description: "UNESCO ancient town with lantern-lit streets and tailor shops.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "nha-trang",
      name: "Nha Trang",
      country: "Vyetnam",
      description: "Coastal city with scuba diving, islands and mud baths.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "goa",
      name: "Goa",
      country: "Hindiston",
      description: "Beach state with Portuguese churches and vibrant nightlife.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "jaipur",
      name: "Jaipur",
      country: "Hindiston",
      description: "Pink City with forts, palaces and bustling bazaars.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "agra",
      name: "Agra",
      country: "Hindiston",
      description: "Home of the iconic Taj Mahal and Mughal heritage.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "aswan",
      name: "Aswan",
      country: "Misr",
      description: "Nile-side city with Philae Temple and desert landscapes.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "orhei",
      name: "Orhei",
      country: "Moldova",
      description: "Ancient cave city and wine region with monasteries.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "sheki",
      name: "Sheki",
      country: "Ozarbayjon",
      description: "Historic silk-road town with Khan's Palace and tea houses.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "dilijan",
      name: "Dilijan",
      country: "Armaniston",
      description: "Armenian Switzerland with forests, lakes and artisan villages.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "kazbegi",
      name: "Kazbegi",
      country: "Gruziya",
      description: "Mountain village with iconic Gergeti Trinity Church.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "odesa",
      name: "Odesa",
      country: "Ukraina",
      description: "Port city with Potemkin Stairs and opera house.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "vang-vieng",
      name: "Vang Vieng",
      country: "Laos",
      description: "Adventure hub with limestone karsts and tubing on the river.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "tripoli",
      name: "Tripoli",
      country: "Livan",
      description: "Historic city with Ottoman souks and Mamluk architecture.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "chitwan",
      name: "Chitwan",
      country: "Nepal",
      description: "Jungle paradise with rhinos, tigers and elephant safaris.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "sal",
      name: "Sal",
      country: "Kabo-Verde",
      description: "Sunny island with golden beaches and windsurfing.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "moheli",
      name: "Moheli",
      country: "Komor orollari",
      description: "Unspoiled island with turtle nesting beaches and hiking.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "nosy-be",
      name: "Nosy Be",
      country: "Madagaskar",
      description: "Perfume island with turquoise water and lemurs.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
    {
      key: "grand-baie",
      name: "Grand Baie",
      country: "Mavrikiy",
      description: "Lively seaside village with shopping and water sports.",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"],
    },
    {
      key: "bazaruto",
      name: "Bazaruto",
      country: "Mozambik",
      description: "Archipelago with untouched coral reefs and dugongs.",
      images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"],
    },
    {
      key: "babeldaob",
      name: "Babeldaob",
      country: "Palau",
      description: "Largest island with freshwater lakes and WWII bunkers.",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
    },
    {
      key: "funafuti",
      name: "Funafuti",
      country: "Tuvalu",
      description: "Tiny atoll capital with friendly locals and ocean views.",
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"],
    },
    {
      key: "victoria-falls",
      name: "Victoria Falls",
      country: "Zimbabve",
      description: "Mighty waterfall on the Zambezi with adventure activities.",
      images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"],
    },
    {
      key: "ella",
      name: "Ella",
      country: "Shri-Lanka",
      description: "Hill-country village with tea plantations and train views.",
      images: ["https://images.unsplash.com/photo-1508051123996-69f8caf4891e?w=800&h=600&fit=crop"],
    },
  ];

  const uzbekistanRegions: DestinationData[] = [
    {
      key: "andijan",
      name: "Andijon viloyati",
      country: "O‘zbekiston",
      description: "Sharqiy O‘zbekistonning tarixiy shaharlari va tog‘li tabiatini kashf eting.",
      images: [
        "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "bukhara",
      name: "Buxoro viloyati",
      country: "O‘zbekiston",
      description: "Sulton Islom madrasasi va qadimiy shaharlari bilan mashhur bo‘lgan hudud.",
      images: [
        "https://images.unsplash.com/photo-1542596594-7ff579dfc784?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "fergana",
      name: "Farg‘ona viloyati",
      country: "O‘zbekiston",
      description: "Gulzor vodiysi, tarixiy ziyoratgohlar va madaniyat markazlarini o‘z ichiga oladi.",
      images: [
        "https://images.unsplash.com/photo-1526481280692-210c53933a86?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "jizzakh",
      name: "Jizzax viloyati",
      country: "O‘zbekiston",
      description: "Qadimiy arxeologik yodgorliklar va keng yaylovlarga boy viloyat.",
      images: [
        "https://images.unsplash.com/photo-1517638851339-4d0843fd6a60?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "namangan",
      name: "Namangan viloyati",
      country: "O‘zbekiston",
      description: "Farg‘ona vodiysining markazi, mazali taomlar va an’anaviy hunarmandchiligi bilan.",
      images: [
        "https://images.unsplash.com/photo-1534323101319-9b369301cb75?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "navoi",
      name: "Navoiy viloyati",
      country: "O‘zbekiston",
      description: "Cho‘l sahrolari, tarixiy yodgorliklar va eksklyuziv tabiat joylari.",
      images: [
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "qashqadaryo",
      name: "Qashqadaryo viloyati",
      country: "O‘zbekiston",
      description: "Tarix, tabiat va cho‘l manzaralarining noyob uyg‘unligi.",
      images: [
        "https://images.unsplash.com/photo-1601993499782-18c8a8c10f10?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "samarqand",
      name: "Samarqand viloyati",
      country: "O‘zbekiston",
      description: "O‘zbekistonda tarixiy meros va qadimiy me’moriy obidalar markazi.",
      images: [
        "https://images.unsplash.com/photo-1505471768195-1f817b1b5469?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "sirdaryo",
      name: "Sirdaryo viloyati",
      country: "O‘zbekiston",
      description: "Suv manbalari va dam olish uchun tinch tabiat maskani.",
      images: [
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "surxondaryo",
      name: "Surxondaryo viloyati",
      country: "O‘zbekiston",
      description: "G‘arbiy cho‘l, tarixiy yodgorliklar va tabiiy ko‘llar bilan mashhur.",
      images: [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "toshkent",
      name: "Toshkent viloyati",
      country: "O‘zbekiston",
      description: "Poytaxt yaqinidagi zamonaviy va tarixiy joylarni kashf qiling.",
      images: [
        "https://images.unsplash.com/photo-1516685018646-549d9c0d27a8?w=800&h=600&fit=crop",
      ],
    },
    {
      key: "xorazm",
      name: "Xorazm viloyati",
      country: "O‘zbekiston",
      description: "Qadimiy xonliklar tarixi va Amudaryo bo‘yidagi sayyohlik joylari.",
      images: [
        "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&h=600&fit=crop",
      ],
    },
  ];

  const countries = [
    { key: "uzbekistan", name: "O'zbekiston", type: "domestic" },
    { key: "kyrgyzstan", name: "Qirg'iziston", type: "international" },
    { key: "kazakhstan", name: "Qozog'iston", type: "international" },
    { key: "tajikistan", name: "Tojikiston", type: "international" },
    { key: "russia", name: "Rossiya", type: "international" },
    { key: "belarus", name: "Belarus", type: "international" },
    { key: "azerbaijan", name: "Ozarbayjon", type: "international" },
    { key: "armenia", name: "Armaniston", type: "international" },
    { key: "georgia", name: "Gruziya", type: "international" },
    { key: "ukraine", name: "Ukraina", type: "international" },
    { key: "moldova", name: "Moldova", type: "international" },
    { key: "turkey", name: "Turkiya", type: "international" },
    { key: "malaysia", name: "Malayziya", type: "international" },
    { key: "thailand", name: "Tailand", type: "international" },
    { key: "china", name: "Xitoy", type: "international" },
    { key: "uae", name: "BAA", type: "international" },
    { key: "oman", name: "Ummon", type: "international" },
    { key: "jordan", name: "Iordaniya", type: "international" },
    { key: "iran", name: "Eron", type: "international" },
    { key: "mongolia", name: "Mo'g'uliston", type: "international" },
    { key: "philippines", name: "Filippin", type: "international" },
    { key: "antigua-barbuda", name: "Antigua va Barbuda", type: "international" },
    { key: "barbados", name: "Barbados", type: "international" },
    { key: "dominica", name: "Dominika", type: "international" },
    { key: "haiti", name: "Gaiti", type: "international" },
    { key: "st-vincent", name: "Sent-Vinsent va Grenadin", type: "international" },
    { key: "micronesia", name: "Mikroneziya", type: "international" },
    { key: "suriname", name: "Surinam", type: "international" },
    { key: "kenya", name: "Keniya", type: "international" },
    { key: "maldives", name: "Maldiv orollari", type: "international" },
    { key: "saudi-arabia", name: "Saudiya Arabistoni", type: "international" },
    { key: "indonesia", name: "Indoneziya / Bali", type: "international" },
    { key: "cambodia", name: "Kambodja", type: "international" },
    { key: "laos", name: "Laos", type: "international" },
    { key: "lebanon", name: "Livan", type: "international" },
    { key: "nepal", name: "Nepal", type: "international" },
    { key: "cabo-verde", name: "Kabo-Verde", type: "international" },
    { key: "comoros", name: "Komor orollari", type: "international" },
    { key: "madagascar", name: "Madagaskar", type: "international" },
    { key: "mauritius", name: "Mavrikiy", type: "international" },
    { key: "mozambique", name: "Mozambik", type: "international" },
    { key: "palau", name: "Palau", type: "international" },
    { key: "samoa", name: "Samoa", type: "international" },
    { key: "tuvalu", name: "Tuvalu", type: "international" },
    { key: "zimbabwe", name: "Zimbabve", type: "international" },
    { key: "macao", name: "Makao", type: "international" },
    { key: "vietnam", name: "Vyetnam", type: "international" },
    { key: "india", name: "Hindiston", type: "international" },
    { key: "qatar", name: "Qatar", type: "international" },
    { key: "sri-lanka", name: "Shri-Lanka", type: "international" },
    { key: "egypt", name: "Misr", type: "international" },
  ];

  const addressesByCountry: Record<string, DestinationData[]> = {
    uzbekistan: uzbekistanRegions,
    kyrgyzstan: destinationCatalog.filter((d) => d.country === "Qirg'iziston"),
    kazakhstan: destinationCatalog.filter((d) => d.country === "Qozog'iston"),
    tajikistan: destinationCatalog.filter((d) => d.country === "Tojikiston"),
    russia: destinationCatalog.filter((d) => d.country === "Rossiya"),
    belarus: destinationCatalog.filter((d) => d.country === "Belarus"),
    azerbaijan: destinationCatalog.filter((d) => d.country === "Ozarbayjon"),
    armenia: destinationCatalog.filter((d) => d.country === "Armaniston"),
    georgia: destinationCatalog.filter((d) => d.country === "Gruziya"),
    ukraine: destinationCatalog.filter((d) => d.country === "Ukraina"),
    moldova: destinationCatalog.filter((d) => d.country === "Moldova"),
    turkey: destinationCatalog.filter((d) => d.country === "Turkiya"),
    malaysia: destinationCatalog.filter((d) => d.country === "Malayziya"),
    thailand: destinationCatalog.filter((d) => d.country === "Tailand"),
    china: destinationCatalog.filter((d) => d.country === "Xitoy"),
    uae: destinationCatalog.filter((d) => d.country === "BAA"),
    oman: destinationCatalog.filter((d) => d.country === "Ummon"),
    jordan: destinationCatalog.filter((d) => d.country === "Iordaniya"),
    iran: destinationCatalog.filter((d) => d.country === "Eron"),
    mongolia: destinationCatalog.filter((d) => d.country === "Mo'g'uliston"),
    philippines: destinationCatalog.filter((d) => d.country === "Filippin"),
    "antigua-barbuda": destinationCatalog.filter((d) => d.country === "Antigua va Barbuda"),
    barbados: destinationCatalog.filter((d) => d.country === "Barbados"),
    dominica: destinationCatalog.filter((d) => d.country === "Dominika"),
    haiti: destinationCatalog.filter((d) => d.country === "Gaiti"),
    "st-vincent": destinationCatalog.filter((d) => d.country === "Sent-Vinsent va Grenadin"),
    micronesia: destinationCatalog.filter((d) => d.country === "Mikroneziya"),
    suriname: destinationCatalog.filter((d) => d.country === "Surinam"),
    kenya: destinationCatalog.filter((d) => d.country === "Keniya"),
    maldives: destinationCatalog.filter((d) => d.country === "Maldiv orollari"),
    "saudi-arabia": destinationCatalog.filter((d) => d.country === "Saudiya Arabistoni"),
    indonesia: destinationCatalog.filter((d) => d.country === "Indoneziya / Bali"),
    cambodia: destinationCatalog.filter((d) => d.country === "Kambodja"),
    laos: destinationCatalog.filter((d) => d.country === "Laos"),
    lebanon: destinationCatalog.filter((d) => d.country === "Livan"),
    nepal: destinationCatalog.filter((d) => d.country === "Nepal"),
    "cabo-verde": destinationCatalog.filter((d) => d.country === "Kabo-Verde"),
    comoros: destinationCatalog.filter((d) => d.country === "Komor orollari"),
    madagascar: destinationCatalog.filter((d) => d.country === "Madagaskar"),
    mauritius: destinationCatalog.filter((d) => d.country === "Mavrikiy"),
    mozambique: destinationCatalog.filter((d) => d.country === "Mozambik"),
    palau: destinationCatalog.filter((d) => d.country === "Palau"),
    samoa: destinationCatalog.filter((d) => d.country === "Samoa"),
    tuvalu: destinationCatalog.filter((d) => d.country === "Tuvalu"),
    zimbabwe: destinationCatalog.filter((d) => d.country === "Zimbabve"),
    macao: destinationCatalog.filter((d) => d.country === "Makao"),
    vietnam: destinationCatalog.filter((d) => d.country === "Vyetnam"),
    india: destinationCatalog.filter((d) => d.country === "Hindiston"),
    qatar: destinationCatalog.filter((d) => d.country === "Qatar"),
    "sri-lanka": destinationCatalog.filter((d) => d.country === "Shri-Lanka"),
    egypt: destinationCatalog.filter((d) => d.country === "Misr"),
  };

  const [selectedDestination, setSelectedDestination] = useState<DestinationData | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedDestination || selectedDestination.key === "current-location") {
      setDestInfo(null);
      return;
    }
    setDestInfoLoading(true);
    setDestInfo(null);
    const API_URL = "";
    fetch(`${API_URL}/api/ai/destination-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: selectedDestination.name,
          country: selectedDestination.country,
          lang: i18n.language,
        }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.highlights) setDestInfo(data); })
      .catch(() => {})
      .finally(() => setDestInfoLoading(false));
  }, [selectedDestination]);

  const lookupDestination = (value: string) => {
    const normalized = value.toLowerCase().trim();
    if (!normalized) {
      setSelectedDestination(null);
      setLocationMessage("");
      return;
    }

    const catalogMatch = destinationCatalog.find(
      (item) =>
        normalized.includes(item.key) ||
        item.name.toLowerCase() === normalized ||
        item.country.toLowerCase() === normalized,
    );

    const regionMatch = uzbekistanRegions.find(
      (item) =>
        normalized.includes(item.key) ||
        item.name.toLowerCase() === normalized,
    );

    const match = catalogMatch || regionMatch;

    if (match) {
      setSelectedDestination(match);
      setLocationMessage(t("customPackage.locationDetected", { place: match.name }));
    } else {
      setSelectedDestination(null);
      setLocationMessage(t("customPackage.noLocationMatch"));
    }
  };

  const handleAddressSelect = (addressKey: string) => {
    const addresses = formData.selectedCountry
      ? addressesByCountry[formData.selectedCountry] || []
      : [...uzbekistanRegions, ...destinationCatalog];
    const address = addresses.find((item) => item.key === addressKey) || null;
    if (address) {
      setFormData((prev) => ({
        ...prev,
        destination: address.key,
        selectedCountry: address.country === "O'zbekiston" || address.country === "O‘zbekiston" ? "uzbekistan" : address.country.toLowerCase(),
      }));
      setSelectedDestination(address);
      setLocationMessage(t("customPackage.locationDetected", { place: address.name }));
    } else {
      setFormData((prev) => ({ ...prev, destination: "" }));
      setSelectedDestination(null);
      setLocationMessage("");
    }
  };

  const updateDestination = (value: string) => {
    setFormData((prev) => ({ ...prev, destination: value }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const normalized = value.toLowerCase().trim();
    if (!normalized || normalized.length < 2) {
      setSelectedDestination(null);
      setLocationMessage("");
      return;
    }

    const searchScope = formData.selectedCountry
      ? addressesByCountry[formData.selectedCountry] || []
      : [...uzbekistanRegions, ...destinationCatalog];

    const match = searchScope.find(
      (item) =>
        normalized.includes(item.key) ||
        item.name.toLowerCase() === normalized ||
        item.country.toLowerCase() === normalized,
    );

    if (match) {
      setSelectedDestination(match);
      setLocationMessage(t("customPackage.locationDetected", { place: match.name }));
      return;
    }

    if (formData.destinationType === "international") {
      debounceRef.current = setTimeout(() => {
        setSelectedDestination({
          key: normalized.replace(/\s+/g, "-"),
          name: value.trim(),
          country: formData.selectedCountry
            ? countries.find((c) => c.key === formData.selectedCountry)?.name || value.trim()
            : value.trim(),
          description: "",
          images: [],
        });
        setLocationMessage(t("customPackage.locationDetected", { place: value.trim() }));
      }, 700);
    } else {
      setSelectedDestination(null);
      setLocationMessage(t("customPackage.noLocationMatch"));
    }
  };

  const getMapQuery = () => {
    if (selectedDestination?.key === "current-location") {
      return formData.destination.trim();
    }
    if (selectedDestination?.name) {
      return selectedDestination.name;
    }
    return formData.destination.trim();
  };

  const mapQuery = getMapQuery();
  const destinationLabel = selectedDestination?.name || formData.destination.trim();

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(t("customPackage.locationNotSupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let placeName = t("customPackage.currentLocation");
        try {
          const res = await fetch(
            `/api/places/geocode?q=${encodeURIComponent(`${lat}, ${lng}`)}`,
          );
          const data = await res.json();
          if (data.displayName) placeName = data.displayName.split(",").slice(0, 2).join(", ");
        } catch (_) {}

        const searchScope = formData.selectedCountry
          ? addressesByCountry[formData.selectedCountry] || []
          : [...uzbekistanRegions, ...destinationCatalog];

        const match = searchScope.find(
          (item) =>
            placeName.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(placeName.toLowerCase()),
        );

        if (match) {
          setFormData((prev) => ({
            ...prev,
            destination: match.key,
            selectedCountry: match.country === "O'zbekiston" || match.country === "O‘zbekiston" ? "uzbekistan" : match.country.toLowerCase(),
          }));
          setSelectedDestination(match);
          setLocationMessage(t("customPackage.locationDetected", { place: match.name }));
        } else {
          setFormData((prev) => ({
            ...prev,
            destination: placeName,
          }));
          setSelectedDestination({
            key: "current-location",
            name: placeName,
            country: formData.selectedCountry
              ? countries.find((c) => c.key === formData.selectedCountry)?.name || t("customPackage.currentLocation")
              : t("customPackage.currentLocation"),
            description: t("customPackage.currentLocationDescription"),
            images: [
              "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop",
              "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&h=600&fit=crop",
            ],
          });
          setLocationMessage(t("customPackage.locationDetected", { place: placeName }));
        }
      },
      () => {
        setLocationMessage(t("customPackage.locationDenied"));
      },
    );
  };

  const totalSteps = 8;

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (currentStep === 8 && !aiRecommendation && !aiLoading) {
      const API_URL = "";
      setAiLoading(true);
      setAiError("");
      fetch(`${API_URL}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, destination: destinationLabel, lang: i18n.language }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.recommendation) {
            setAiRecommendation(data.recommendation);
          } else {
            setAiError(data.error || "AI xatosi yuz berdi.");
          }
        })
        .catch(() => setAiError("Serverga ulanishda xato."))
        .finally(() => setAiLoading(false));
    }
  }, [currentStep]);

  const calculateDaysAway = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : null;
  };

  const getEndDateFromDays = (startDate: string, days: number) => {
    if (!startDate || days <= 0) return "";
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return "";
    const end = new Date(start);
    end.setDate(end.getDate() + days - 1);
    return end.toISOString().slice(0, 10);
  };

  const updateDays = (days: number) => {
    const normalized = Math.max(1, days);
    setFormData((prev) => ({
      ...prev,
      days: normalized,
      endDate: prev.startDate ? getEndDateFromDays(prev.startDate, normalized) : prev.endDate,
    }));
  };

  const handleFindMatches = () => {
    if (!user) { setShowLoginModal(true); return; }
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      const err = bookingDateError(formData.startDate);
      if (err) {
        setDateError(err);
        return;
      }
      setDateError("");
    }
    if (currentStep === 4) {
      if (!formData.budget) {
        setBudgetError("Byudjetni kiriting");
        return;
      }
      setBudgetError("");
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const planTemplates = [
    {
      id: "samarkand",
      title: "Samarqand Klassik",
      emoji: "🕌",
      image: PACKAGE_MEDIA["domestic-1"].cover,
      tags: ["3 kun", "Ichki"],
      description: "Registon, Shohizinda va Gur-Amir maqbarasi",
      presets: { destination: "Samarkand", destinationType: "domestic", days: 3, travelers: 2, transport: "Train", interests: ["Historical", "Culture"] as string[], budget: "", hotelType: "" },
    },
    {
      id: "bukhara",
      title: "Buxoro & Xiva",
      emoji: "🏰",
      image: PACKAGE_MEDIA["domestic-2"].cover,
      tags: ["5 kun", "Ichki"],
      description: "Qadimiy bozorlar, madrasalar va qal'alar",
      presets: { destination: "Bukhara", destinationType: "domestic", days: 5, travelers: 2, transport: "Private Car", interests: ["Historical", "Photography"] as string[], budget: "", hotelType: "" },
    },
    {
      id: "dubai",
      title: "Dubai Grand Tour",
      emoji: "🌆",
      image: PACKAGE_MEDIA["international-2"].cover,
      tags: ["6 kun", "Xalqaro"],
      description: "Burj Khalifa, desert safari, luxury hotels",
      presets: { destination: "Dubai", destinationType: "international", days: 6, travelers: 2, transport: "Flight", interests: ["Shopping", "Family"] as string[], budget: "", hotelType: "" },
    },
    {
      id: "thailand",
      title: "Thailand Beach",
      emoji: "🏖️",
      image: PACKAGE_MEDIA["international-3"].cover,
      tags: ["7 kun", "Xalqaro"],
      description: "Phuket, Bangkok, tropik jannat",
      presets: { destination: "Thailand", destinationType: "international", days: 7, travelers: 2, transport: "Flight", interests: ["Beach", "Food"] as string[], budget: "", hotelType: "" },
    },
    {
      id: "santorini",
      title: "Santorini",
      emoji: "🌅",
      image: PACKAGE_MEDIA["international-9"].cover,
      tags: ["5 kun", "Xalqaro"],
      description: "Oq-ko'k shaharchalar va dengiz manzarasi",
      presets: { destination: "Santorini", destinationType: "international", days: 5, travelers: 2, transport: "Flight", interests: ["Beach", "Photography"] as string[], budget: "", hotelType: "" },
    },
    {
      id: "custom",
      title: "O'z Paketim",
      emoji: "✏️",
      image: PACKAGE_MEDIA["domestic-1"]?.cover ?? "",
      tags: ["Erkin"],
      description: "Barcha tafsilotlarni o'zim belgilayman",
      presets: null,
    },
  ];

  const selectPlan = (plan: typeof planTemplates[0]) => {
    if (plan.presets) {
      const countryMap: Record<string, string> = {
        domestic: "uzbekistan",
        international: "uae",
      };
      setFormData((prev) => ({
        ...prev,
        ...plan.presets,
        selectedCountry: countryMap[plan.presets.destinationType] || "",
      }));
    }
    setPlanSelected(true);
    setCurrentStep(1);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const getBudgetTier = (): 'budget' | 'mid-range' | 'luxury' | null => {
    const b = formData.budget;
    if (b === 'budget' || b === 'mid-range' || b === 'luxury') return b as 'budget' | 'mid-range' | 'luxury';
    if (b === t("customPackage.budgetOptions.budget")) return 'budget';
    if (b === t("customPackage.budgetOptions.midRange")) return 'mid-range';
    if (b === t("customPackage.budgetOptions.luxury")) return 'luxury';
    const amount = parseInt(b.replace(/[^0-9]/g, ''));
    if (!isNaN(amount) && amount > 0) {
      if (amount < 500) return 'budget';
      if (amount < 1500) return 'mid-range';
      return 'luxury';
    }
    return null;
  };

  const interestOptions = [
    { key: "historical", label: t("customPackage.interests.historical") },
    { key: "nature", label: t("customPackage.interests.nature") },
    { key: "beach", label: t("customPackage.interests.beach") },
    { key: "culture", label: t("customPackage.interests.culture") },
    { key: "food", label: t("customPackage.interests.food") },
    { key: "shopping", label: t("customPackage.interests.shopping") },
    { key: "photography", label: t("customPackage.interests.photography") },
    { key: "family", label: t("customPackage.interests.family") },
    { key: "nightlife", label: t("customPackage.interests.nightlife") },
  ];

  const CATEGORY_INTEREST_MAP: Record<string, string[]> = {
    historical: ["historical", "pilgrimage"],
    nature: ["nature", "adventure"],
    beach: ["beach"],
    culture: ["historical", "family"],
    shopping: ["shopping"],
    photography: ["nature", "historical"],
    family: ["family"],
    nightlife: ["luxury"],
  };

  const BUDGET_TIER_RANGE: Record<'budget' | 'mid-range' | 'luxury', [number, number]> = {
    budget: [0, 500],
    'mid-range': [500, 1500],
    luxury: [1500, Infinity],
  };

  const parseDurationDays = (duration: string): number => {
    const match = duration?.match(/\d+/);
    return match ? Math.max(1, parseInt(match[0], 10)) : 1;
  };

  const scorePackage = (pkg: TravelPackage): number => {
    let score = 0;

    if (destinationLabel) {
      const needle = destinationLabel.toLowerCase();
      if (pkg.title.toLowerCase().includes(needle) || pkg.country?.toLowerCase().includes(needle)) {
        score += 50;
      }
    }

    const activeInterestKeys = interestOptions
      .filter((opt) => formData.interests.includes(opt.label))
      .map((opt) => opt.key);
    if (activeInterestKeys.some((key) => CATEGORY_INTEREST_MAP[key]?.includes(pkg.category))) {
      score += 20;
    }

    const budgetTier = getBudgetTier();
    if (budgetTier) {
      const [min, max] = BUDGET_TIER_RANGE[budgetTier];
      const perDay = pkg.price / parseDurationDays(pkg.duration);
      if (perDay >= min && perDay <= max) score += 15;
    }

    if (formData.hotelType) {
      const starMatch = formData.hotelType.match(/\d/);
      if (starMatch && pkg.hotel?.includes(starMatch[0])) score += 10;
    }

    if (formData.transport) {
      const wantsFlight = /flight|samolyot|самол/i.test(formData.transport);
      if (wantsFlight === !!pkg.flightIncluded) score += 10;
    }

    return score;
  };

  const sortedMatches = useMemo(() => {
    return [...matchPackages].sort((a, b) => {
      const diff = scorePackage(b) - scorePackage(a);
      return diff !== 0 ? diff : b.rating - a.rating;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchPackages, formData, destinationLabel]);

  // AI Combo Tour tavsiyasi — AI yangi combo yaratmaydi, faqat tizimda oldindan
  // mavjud bo'lgan Combo Tour paketlari orasidan foydalanuvchining byudjeti, sayohat
  // davomiyligi va qiziqishlariga mos kelganini tanlab tavsiya qiladi.
  const comboBudget = useMemo(() => {
    const b = formData.budget;
    if (!b) return undefined;
    if (b.startsWith("$")) {
      const n = parseInt(b.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? undefined : n;
    }
    if (b === "budget") return 500;
    if (b === "mid-range") return 1500;
    if (b === "luxury") return 3000;
    const tier = getBudgetTier();
    if (tier === "budget") return 500;
    if (tier === "mid-range") return 1500;
    if (tier === "luxury") return 3000;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.budget]);

  const comboRecommendations = useMemo(() => {
    if (formData.destinationType !== "international" || !destinationLabel) return [];
    return recommendComboTours({
      country: destinationLabel,
      budget: comboBudget,
      days: formData.days,
      interests: formData.interests,
    });
  }, [destinationLabel, comboBudget, formData.days, formData.interests, formData.destinationType]);

  const getTransportIcon = (key: string, selected: boolean) => {
    const cls = `w-8 h-8 mb-3 mx-auto ${selected ? "text-white" : "text-blue-600"}`;
    if (key === "flight") return <Plane className={cls} />;
    if (key === "bus") return <Bus className={cls} />;
    if (key === "train") return <Train className={cls} />;
    return <Car className={cls} />;
  };

  const getInterestIcon = (key: string, selected: boolean) => {
    const cls = `w-5 h-5 ${selected ? "text-white" : "text-blue-500"}`;
    const map: Record<string, React.ReactNode> = {
      historical: <Landmark className={cls} />,
      nature: <TreePine className={cls} />,
      beach: <Waves className={cls} />,
      culture: <Palette className={cls} />,
      food: <Utensils className={cls} />,
      shopping: <ShoppingBag className={cls} />,
      photography: <Camera className={cls} />,
      family: <Heart className={cls} />,
      nightlife: <Moon className={cls} />,
    };
    return map[key] || <Sparkles className={cls} />;
  };

  const getBlockedTransportKeys = (): string[] => {
    if (formData.destinationType === 'international') return ['bus', 'train'];
    if (formData.destinationType === 'domestic') return ['flight'];
    return [];
  };

  const transportBlockReason: Record<string, string> = {
    bus: "Xalqaro marshrut uchun mos emas",
    train: "Bu yo'nalishda poyezd yo'q",
    flight: "Ichki sayohatda samolyot shart emas",
  };

  const planIcons: Record<string, React.ReactNode> = {
    samarkand: <Landmark className="w-5 h-5 text-amber-600" />,
    bukhara: <Landmark className="w-5 h-5 text-amber-600" />,
    dubai: <Building2 className="w-5 h-5 text-blue-600" />,
    thailand: <Waves className="w-5 h-5 text-cyan-500" />,
    santorini: <Waves className="w-5 h-5 text-blue-500" />,
    custom: <Sparkles className="w-5 h-5 text-purple-600" />,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step1")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("customPackage.selectCountryPlaceholder")}
                </label>
                <select
                  value={formData.selectedCountry}
                  onChange={(e) => {
                    const country = countries.find((c) => c.key === e.target.value);
                    if (country) {
                      setFormData((prev) => ({
                        ...prev,
                        selectedCountry: country.key,
                        destinationType: country.type,
                        destination: "",
                      }));
                      setSelectedDestination(null);
                      setLocationMessage("");
                    }
                  }}
                  className="w-full px-4 py-3 border border-sky-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">{t("customPackage.selectCountryPlaceholder")}</option>
                  {countries.map((country) => (
                    <option key={country.key} value={country.key}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.selectedCountry && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t("customPackage.selectAddressPlaceholder")}
                  </label>
                  <div className="flex flex-col gap-3">
                    <select
                      value={formData.destination}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className="w-full px-4 py-3 border border-sky-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">{t("customPackage.selectAddressPlaceholder")}</option>
                      {(addressesByCountry[formData.selectedCountry] || []).map((addr) => (
                        <option key={addr.key} value={addr.key}>
                          {addr.name}
                        </option>
                      ))}
                    </select>
                    {formData.destinationType === "international" && (
                      <button
                        onClick={handleUseCurrentLocation}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] px-5 py-3 text-white shadow-lg shadow-[#06B6D4]/30 hover:from-[#1E40AF] hover:to-[#0891B2] transition"
                      >
                        {t("customPackage.useLocation")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {locationMessage && (
                <p className="text-sm text-slate-500">{locationMessage}</p>
              )}

              {selectedDestination && (
                <div className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-sky-600 uppercase tracking-[0.2em] mb-2">
                        {formData.destinationType === "international"
                          ? t("hero.international")
                          : t("hero.domestic")}
                      </p>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {selectedDestination.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedDestination.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        {t("customPackage.placeCard")}
                      </span>
                    </div>
                  </div>
                  {selectedDestination.description && (
                    <p className="text-sm text-slate-700 mt-4 mb-4 leading-7">
                      {selectedDestination.description}
                    </p>
                  )}
                  {selectedDestination.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedDestination.images.slice(0, 2).map((src, index) => (
                        <PackageImage
                          key={index}
                          src={src}
                          alt={`${selectedDestination.name} ${index + 1}`}
                          className="h-32 w-full rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AI Destination Info Card */}
              {(destInfoLoading || destInfo) && selectedDestination && (
                <div className="rounded-[2rem] border border-[#06B6D4]/10 bg-gradient-to-br from-[#E5E7EB] to-[#DBEAFE] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                    <span className="text-sm font-semibold text-[#1E3A8A]">{t("chat.aiInfo")}</span>
                  </div>
                  {destInfoLoading ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                      </div>
                      {t("chat.aiLoading")}
                    </div>
                  ) : destInfo && (
                    <div className="space-y-3">
                      <ul className="space-y-1.5">
                        {destInfo.highlights?.map((h, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                      {destInfo.bestTime && (
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold">🗓 {t("chat.bestTime")}:</span> {destInfo.bestTime}
                        </p>
                      )}
                      {destInfo.prices && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                            💰 {t("chat.prices")} ({t("chat.perDay")})
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {(["budget", "midRange", "luxury"] as const).map((level) => (
                              <div key={level} className="bg-white rounded-xl p-2.5 text-center border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-400 mb-1 capitalize">
                                  {level === "midRange" ? "Mid" : level}
                                </div>
                                <div className="text-xs font-bold text-slate-800">
                                  {destInfo.prices[level]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {destInfo.tip && (
                        <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs text-slate-600">
                          💡 <span className="font-semibold">{t("chat.tip")}:</span> {destInfo.tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {mapQuery && (
                <DestinationMap
                  query={mapQuery}
                  title={t("customPackage.mapTitle")}
                  subtitle={t("customPackage.mapSubtitle")}
                />
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step2")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("customPackage.startDateLabel")}
                </label>
                <input
                  type="date"
                  min={minBookableDate}
                  value={formData.startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateError(isDateBookable(value) ? "" : bookingDateError(value) || "");
                    setFormData((prev) => ({
                      ...prev,
                      startDate: value,
                      endDate: prev.days ? getEndDateFromDays(value, prev.days) : prev.endDate,
                    }));
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dateError && (
                  <p className="text-sm text-red-500 mt-1">{dateError}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Bugun va o&apos;tgan kunlar tanlanmaydi — faqat ertadan boshlab.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold">
                    {t("customPackage.tripLengthLabel")}
                  </label>
                  <span className="text-sm text-slate-500">
                    {formData.days} {t("customPackage.days")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateDays(formData.days - 1)}
                    className="h-12 w-12 rounded-full bg-slate-100 hover:bg-slate-200 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={formData.days}
                    onChange={(e) => updateDays(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => updateDays(formData.days + 1)}
                    className="h-12 w-12 rounded-full bg-slate-100 hover:bg-slate-200 transition"
                  >
                    +
                  </button>
                </div>
                <div className="mt-4 rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 text-slate-700 shadow-sm">
                  <div className="text-sm font-semibold">{t("customPackage.endDateLabel")}</div>
                  <div className="mt-2">
                    {formData.startDate
                      ? getEndDateFromDays(formData.startDate, formData.days) || t("customPackage.invalidDate")
                      : t("customPackage.selectStartDateFirst")}
                  </div>
                </div>
              </div>
            </div>
            {calculateDaysAway(formData.startDate, formData.endDate) !== null && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mt-6 text-slate-700">
                {t("customPackage.daysAwaySummary", {
                  days: calculateDaysAway(formData.startDate, formData.endDate),
                })}
              </div>
            )}
          </div>
        );

      case 3:
        return (
            <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step3")}</h2>
            <div className="rounded-[2rem] bg-white/95 border border-slate-200 p-6 sm:p-8 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.25)] flex items-center justify-between gap-4">
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    travelers: Math.max(1, formData.travelers - 1),
                  })
                }
                className="w-12 h-12 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-2xl"
              >
                -
              </button>
              <div className="text-center flex-1 min-w-0">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-blue-600" />
                <div className="text-4xl sm:text-5xl font-bold">{formData.travelers}</div>
                <div className="text-slate-500 mt-2">{t("customPackage.travelersLabel")}</div>
              </div>
              <button
                onClick={() =>
                  setFormData({ ...formData, travelers: formData.travelers + 1 })
                }
                className="w-12 h-12 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-2xl"
              >
                +
              </button>
            </div>
          </div>
        );

      case 4: {
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step4")}</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("customPackage.labels.budget")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={50}
                max={50000}
                placeholder="Masalan: 1000"
                value={formData.budget ? formData.budget.replace(/[^0-9]/g, '') : ''}
                onChange={(e) => {
                  setBudgetError("");
                  setFormData({ ...formData, budget: e.target.value ? `$${e.target.value}` : "" });
                }}
                className={`w-full px-4 py-3 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${budgetError ? 'border-red-400' : 'border-sky-200'}`}
              />
              {budgetError && (
                <p className="text-sm text-red-500 mt-1">{budgetError}</p>
              )}
            </div>
          </div>
        );
      }

      case 5: {
        const hotelOptions = [
          {
            key: "3-star",
            label: t("customPackage.hotelOptions.threeStar"),
            stars: 3,
            included: ["Nonushta", "Wi-Fi", "Standart xona"],
          },
          {
            key: "4-star",
            label: t("customPackage.hotelOptions.fourStar"),
            stars: 4,
            included: ["Buffet nonushta", "Hovuz", "Gym", "Wi-Fi"],
          },
          {
            key: "5-star",
            label: t("customPackage.hotelOptions.fiveStar"),
            stars: 5,
            included: ["All-inclusive", "Spa", "Konsyerj", "Aeroportga transfer"],
          },
          {
            key: "boutique",
            label: t("customPackage.hotelOptions.boutique"),
            stars: 0,
            included: ["Shaxsiy xizmat", "Noyob tajriba", "Mahalliy ekskursiya"],
          },
        ];

        const budgetTier = getBudgetTier();
        const recommendedKey = budgetTier === 'budget' ? '3-star' : budgetTier === 'luxury' ? '5-star' : budgetTier === 'mid-range' ? '4-star' : null;

        const availableKeys: string[] | null = budgetTier === 'budget'
          ? ['3-star']
          : budgetTier === 'mid-range'
          ? ['3-star', '4-star']
          : budgetTier === 'luxury'
          ? ['4-star', '5-star', 'boutique']
          : null;

        const budgetLabels: Record<string, string> = {
          budget: 'Arzon ($100–500)',
          'mid-range': "O'rta ($500–1500)",
          luxury: 'Hashamatli ($1500+)',
        };

        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step5")}</h2>

            {budgetTier ? (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <span>
                  <span className="font-semibold">{budgetLabels[budgetTier]}</span> budjetiga mos mehmonxonalar faol, qolganlari bloklangan
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
                <Lock className="w-4 h-4 flex-shrink-0" />
                Budjet tanlanmagan — barcha mehmonxonalar mavjud
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {hotelOptions.map((hotel) => {
                const selected = formData.hotelType === hotel.label;
                const isBlocked = availableKeys !== null && !availableKeys.includes(hotel.key);
                const isRecommended = recommendedKey === hotel.key && !selected && !isBlocked;
                return (
                  <button
                    key={hotel.key}
                    disabled={isBlocked}
                    onClick={() => !isBlocked && setFormData({ ...formData, hotelType: hotel.label })}
                    className={`p-6 rounded-[1.75rem] border transition-all shadow-sm relative text-left ${
                      isBlocked
                        ? "border-slate-100 bg-slate-50 opacity-45 cursor-not-allowed grayscale"
                        : selected
                        ? "border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"
                        : isRecommended
                        ? "border-blue-400 ring-2 ring-blue-100 text-slate-700 hover:-translate-y-0.5 hover:shadow-lg"
                        : "border-slate-200 text-slate-700 bg-white hover:-translate-y-0.5 hover:shadow-lg"
                    }`}
                  >
                    {isBlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] bg-slate-100/60 z-10">
                        <Lock className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-400 font-medium">Budjet mos emas</span>
                      </div>
                    )}
                    {isRecommended && (
                      <span className="absolute -top-2.5 left-4 bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold shadow z-10">
                        Tavsiya
                      </span>
                    )}
                    <Hotel className={`w-8 h-8 mb-2 ${selected ? "text-white" : "text-blue-600"}`} />
                    <h3 className="font-bold text-lg">{hotel.label}</h3>
                    {hotel.stars > 0 ? (
                      <div className="flex gap-0.5 my-1.5">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 fill-current ${selected ? "text-yellow-300" : "text-yellow-400"}`} />
                        ))}
                      </div>
                    ) : (
                      <div className="my-1.5 text-xs font-semibold tracking-wide uppercase opacity-70">Boutique</div>
                    )}
                    <ul className={`mt-2 space-y-1 ${selected ? "text-white/80" : "text-slate-400"}`}>
                      {hotel.included.map((item) => (
                        <li key={item} className="text-xs flex items-center gap-1.5">
                          <Check className="w-3 h-3 flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 6: {
        const transportOptions = [
          { key: "flight", label: t("customPackage.transportOptions.flight") },
          { key: "bus", label: t("customPackage.transportOptions.bus") },
          { key: "train", label: t("customPackage.transportOptions.train") },
          { key: "private-car", label: t("customPackage.transportOptions.privateCar") },
        ];

        const blockedKeys = getBlockedTransportKeys();

        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step6")}</h2>

            {/* Marshrut ko'rsatish */}
            {(userCity || destinationLabel) && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#E5E7EB] to-[#DBEAFE] border border-[#06B6D4]/10 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#06B6D4] flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">
                    {userCity || "Joylashuv aniqlanmadi"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-300 flex-shrink-0">
                  <div className="w-2 h-px bg-slate-300" />
                  <div className="w-2 h-px bg-slate-300" />
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Navigation className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">
                    {destinationLabel || "Manzil tanlanmagan"}
                  </span>
                </div>
                {formData.destinationType && (
                  <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    formData.destinationType === 'international'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {formData.destinationType === 'international' ? 'Xalqaro' : 'Ichki'}
                  </span>
                )}
              </div>
            )}

            {/* Bloklash sababini tushuntirish */}
            {blockedKeys.length > 0 && (
              <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-amber-700">
                  {formData.destinationType === 'international'
                    ? "Xalqaro sayohat uchun avtobus va poyezd mavjud emas — faqat samolyot yoki shaxsiy transport."
                    : "Ichki sayohatda samolyot tavsiya etilmaydi — qulay va iqtisodiy alternativlar mavjud."}
                </span>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {transportOptions.map((transport) => {
                const selected = formData.transport === transport.label;
                const isBlocked = blockedKeys.includes(transport.key);
                return (
                  <button
                    key={transport.key}
                    disabled={isBlocked}
                    onClick={() => !isBlocked && setFormData({ ...formData, transport: transport.label })}
                    className={`p-6 rounded-[1.75rem] border transition-all shadow-sm relative ${
                      isBlocked
                        ? "border-slate-100 bg-slate-50 opacity-45 cursor-not-allowed grayscale"
                        : selected
                        ? "border-transparent bg-gradient-to-br from-[#1E3A8A] to-[#06B6D4] text-white shadow-lg"
                        : "border-[#1E3A8A]/10 text-[#1E3A8A]"
                    }`}
                  >
                    {isBlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] bg-slate-100/70 z-10">
                        <Lock className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-400 font-medium text-center px-2">
                          {transportBlockReason[transport.key] || "Mos emas"}
                        </span>
                      </div>
                    )}
                    {getTransportIcon(transport.key, selected)}
                    <h3 className="font-bold text-lg">{transport.label}</h3>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 7: {
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step7")}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {interestOptions.map((interest) => {
                const selected = formData.interests.includes(interest.label);
                return (
                  <button
                    key={interest.key}
                    onClick={() => toggleInterest(interest.label)}
                    className={`p-4 rounded-[1.75rem] border transition-all shadow-sm bg-white hover:-translate-y-0.5 hover:shadow-lg ${
                      selected
                        ? "border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInterestIcon(interest.key, selected)}
                        <span className="font-semibold">{interest.label}</span>
                      </div>
                      {selected && <Check className="w-5 h-5 text-white flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
              {t("customPackage.step8")}
            </h2>
            <div className="bg-gradient-to-br from-[#E5E7EB] to-[#DBEAFE] rounded-2xl p-8">
              <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#1E3A8A]" />
                {aiLoading && (
                  <div className="space-y-2">
                    <p className="text-lg text-slate-600">{t("customPackage.aiGenerating")}</p>
                    <div className="flex justify-center gap-1 mt-3">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                {aiError && (
                  <p className="text-sm text-red-500 mt-2">{aiError}</p>
                )}
                {aiRecommendation && !aiLoading && (
                  <div className="text-left bg-white rounded-2xl p-5 border border-purple-100 shadow-sm mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-600">Groq AI</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{aiRecommendation}</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[1.5rem] p-6 mb-4 border border-slate-200">
                <h3 className="font-bold mb-4">{t("customPackage.contactInfo")}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t("customPackage.placeholders.name")}
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder={t("customPackage.placeholders.phone")}
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-[1.5rem] p-6 mb-4 border border-slate-200">
                <h3 className="font-bold mb-4">{t("customPackage.yourSelections")}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.destination")}:</span>
                    <span className="ml-2 font-semibold">
                      {destinationLabel || t("customPackage.notSpecified")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.type")}:</span>
                    <span className="ml-2 font-semibold">
                      {formData.destinationType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.dates")}:</span>
                    <span className="ml-2 font-semibold">
                      {formData.startDate} {t("customPackage.labels.to")} {formData.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.travelers")}:</span>
                    <span className="ml-2 font-semibold">
                      {formData.travelers}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.budget")}:</span>
                    <span className="ml-2 font-semibold">{formData.budget}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.hotel")}:</span>
                    <span className="ml-2 font-semibold">
                      {formData.hotelType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.transport")}:</span>
                    <span className="ml-2 font-semibold">
                      {formData.transport}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("customPackage.labels.interests")}:</span>
                    <span className="ml-2 font-semibold">
                      {formData.interests.join(", ")}
                    </span>
                  </div>
                  <div className="md:col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Taxminiy byudjetingiz:</span>
                    <span className="ml-2 text-xl font-bold text-blue-600">
                      ${calculateCustomPrice({
                        days: formData.days,
                        travelers: formData.travelers,
                        budget: formData.budget,
                        hotelType: formData.hotelType,
                        transport: formData.transport,
                        destinationType: formData.destinationType,
                      }).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFindMatches}
                className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] text-white py-4 rounded-[1.5rem] hover:shadow-xl transition-all font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {t("customPackage.generate")}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F4] via-[#E5E7EB] to-[#DBEAFE] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] text-white px-5 py-2 rounded-full mb-3 text-sm font-semibold shadow-lg">
              <Building className="w-4 h-4" /> {t("customPackage.matchesLabel")}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("customPackage.matchesTitle")}</h1>
            <p className="text-slate-500 mt-1">{destinationLabel} · {formData.days} kun · {formData.travelers} kishi</p>
          </div>

          {!matchesLoading && comboRecommendations.length > 0 && (
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800">AI tavsiyasi — Combo Tour</h2>
              </div>
              {comboRecommendations.map((rec) => (
                <AiComboBanner key={rec.tour.id} recommendation={rec} />
              ))}
            </div>
          )}

          {matchesLoading ? (
            <div className="flex justify-center gap-1 py-12">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
            </div>
          ) : sortedMatches.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-[2rem] border border-slate-200 mb-8">
              {t("customPackage.noMatches")}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {sortedMatches.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => { setShowResults(false); setPlanSelected(false); setCurrentStep(1); }}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> {t("customPackage.newSearch")}
            </button>
          </div>
          <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleFindMatches} />
        </div>
      </div>
    );
  }

  if (!planSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F4] via-[#E5E7EB] to-[#DBEAFE] py-12 relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-16 h-72 w-72 rounded-full bg-[#06B6D4]/20 blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-24 h-64 w-64 rounded-full bg-[#1E3A8A]/20 blur-3xl" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] text-white px-5 py-2 rounded-full mb-4 shadow-lg text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Tur Yaratish
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Tur rejangizni tanlang</h1>
            <p className="text-slate-500">Tayyor rejadan birini tanlang va o'zingizga moslashtiring</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {planTemplates.map((plan) => (
              <motion.button
                key={plan.id}
                onClick={() => selectPlan(plan)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className={`text-left rounded-[2rem] border shadow-sm transition-all hover:shadow-xl bg-white border-slate-200 overflow-hidden ${
                  plan.id === "custom" ? "border-dashed border-blue-300 bg-blue-50/50" : ""
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <PackageImage
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 text-3xl drop-shadow-md">{plan.emoji}</div>
                </div>
                <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  {planIcons[plan.id]}
                  <h3 className="font-bold text-lg">{plan.title}</h3>
                </div>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-1 text-blue-600 font-semibold text-sm">
                  Tanlash <ArrowRight className="w-4 h-4" />
                </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-16 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl"></div>
      <div className="pointer-events-none absolute left-0 bottom-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>
      <div className="container mx-auto px-4 max-w-4xl relative">
        <div className="mb-4">
          <button
            onClick={() => setPlanSelected(false)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Rejalar ro'yxatiga qaytish
          </button>
        </div>

        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] text-white px-4 sm:px-6 py-2 rounded-full mb-4 shadow-lg shadow-[#06B6D4]/20 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold">{t("customPackage.pageLabel")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            {t("customPackage.title")}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            {t("customPackage.introText")}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              {t("customPackage.stepOf", { current: currentStep, total: totalSteps })}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {userCity && (
          <div className="flex items-center gap-2 mb-4 text-sm bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-slate-500">Siz hozir:</span>
            <span className="font-semibold text-slate-800">{userCity}</span>
            {destinationLabel && (
              <>
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="font-semibold text-blue-600">{destinationLabel}</span>
              </>
            )}
          </div>
        )}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/95 border border-slate-200 rounded-[2rem] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] p-5 sm:p-8 mb-6 sm:mb-8 backdrop-blur-sm"
        >
          {renderStep()}
        </motion.div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all w-full sm:w-auto ${
              currentStep === 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t("customPackage.previous")}
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all w-full sm:w-auto"
            >
              {t("customPackage.next")}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFindMatches}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5" />
              {t("customPackage.generate")}
            </button>
          )}
        </div>
      </div>
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleFindMatches} />
    </div>
  );
}
