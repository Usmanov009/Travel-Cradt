import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/LoginModal";
import { motion } from "motion/react";
import { PACKAGE_MEDIA } from "../data/packageMedia";
import { PackageImage } from "../components/PackageImage";
import { DestinationMap } from "../components/DestinationMap";
import {
  getMinBookableDateString,
  isDateBookable,
  bookingDateError,
} from "../utils/bookingDates";
import { calculateCustomPrice } from "../utils/pricing";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Hotel,
  Car,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Utensils,
  Clock,
  Navigation,
  BedDouble,
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
  const [customBudgetAmount, setCustomBudgetAmount] = useState("");
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
  type ItineraryItem = { time: string; type: string; place: string; note?: string; dish?: string };
  type ItineraryDay = { day: number; title: string; items: ItineraryItem[] };
  type ItineraryVariant = { id: number; theme: string; emoji: string; description: string; title: string; days: ItineraryDay[] };

  const [itineraryVariants, setItineraryVariants] = useState<ItineraryVariant[] | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ItineraryVariant | null>(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState("");
  const [dateError, setDateError] = useState("");
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

  const handleRegionSelect = (regionKey: string) => {
    const region = uzbekistanRegions.find((item) => item.key === regionKey) || null;
    if (region) {
      setFormData((prev) => ({
        ...prev,
        destination: region.key,
      }));
      setSelectedDestination(region);
      setLocationMessage(t("customPackage.locationDetected", { place: region.name }));
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
      return;
    }

    if (!normalized || normalized.length < 2) {
      setSelectedDestination(null);
      setLocationMessage("");
      return;
    }

    if (formData.destinationType === "international") {
      debounceRef.current = setTimeout(() => {
        setSelectedDestination({
          key: normalized.replace(/\s+/g, "-"),
          name: value.trim(),
          country: value.trim(),
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

        setFormData((prev) => ({
          ...prev,
          destination: placeName,
        }));
        setSelectedDestination({
          key: "current-location",
          name: placeName,
          country: t("customPackage.currentLocation"),
          description: t("customPackage.currentLocationDescription"),
          images: [
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&h=600&fit=crop",
          ],
        });
        setLocationMessage(t("customPackage.locationDetected", { place: placeName }));
      },
      () => {
        setLocationMessage(t("customPackage.locationDenied"));
      },
    );
  };

  const navigate = useNavigate();
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

  const handleGenerateCustomPackage = () => {
    if (!user) { setShowLoginModal(true); return; }
    setItineraryLoading(true);
    setItineraryError("");
    setItineraryVariants(null);
    setSelectedVariant(null);

    fetch("/api/ai/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, destination: destinationLabel, lang: i18n.language }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.variants && data.variants.length > 0) {
          setItineraryVariants(data.variants);
        } else {
          setItineraryError(data.error || "Kun tartibi yaratishda xato.");
        }
      })
      .catch(() => setItineraryError("Serverga ulanishda xato."))
      .finally(() => setItineraryLoading(false));
  };

  const handleSelectVariant = (variant: ItineraryVariant) => {
    setSelectedVariant(variant);
    const price = calculateCustomPrice({
      days: formData.days,
      travelers: formData.travelers,
      budget: formData.budget,
      hotelType: formData.hotelType,
      transport: formData.transport,
      destinationType: formData.destinationType,
    });
    const nextBooking = {
      id: Date.now(),
      type: "custom" as const,
      title: variant.title || destinationLabel || t("customPackage.customTitle"),
      price,
      name: formData.name || "",
      phone: formData.phone || "",
      guests: formData.travelers,
      bookedAt: new Date().toISOString(),
      days: formData.days,
      budget: formData.budget,
      hotelType: formData.hotelType,
      transport: formData.transport,
      destinationType: formData.destinationType,
      image: selectedDestination?.images[0] ?? PACKAGE_MEDIA["domestic-13"].cover,
    };
    const bookings = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
    bookings.push(nextBooking);
    localStorage.setItem("travelcraft_bookings", JSON.stringify(bookings));
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
      image: PACKAGE_MEDIA["domestic-13"].cover,
      tags: ["Erkin"],
      description: "Barcha tafsilotlarni o'zim belgilayman",
      presets: null,
    },
  ];

  const selectPlan = (plan: typeof planTemplates[0]) => {
    if (plan.presets) {
      setFormData((prev) => ({ ...prev, ...plan.presets }));
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
    if (!b) return null;
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
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setFormData({ ...formData, destinationType: "domestic" })
                }
                className={`p-6 rounded-[2rem] border transition-all shadow-sm bg-white hover:-translate-y-0.5 hover:shadow-lg ${
                  formData.destinationType === "domestic"
                    ? "border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                <MapPin className={`w-8 h-8 mb-3 ${formData.destinationType === "domestic" ? "text-white" : "text-blue-600"}`} />
                <h3 className="font-bold text-xl mb-2">
                  {t("hero.domestic")}
                </h3>
                <p className={formData.destinationType === "domestic" ? "text-blue-100" : "text-slate-600"}>{t("hero.domesticDesc")}</p>
              </button>
              <button
                onClick={() =>
                  setFormData({ ...formData, destinationType: "international" })
                }
                className={`p-6 rounded-[2rem] border transition-all shadow-sm bg-white hover:-translate-y-0.5 hover:shadow-lg ${
                  formData.destinationType === "international"
                    ? "border-transparent bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                <Sparkles className={`w-8 h-8 mb-3 ${formData.destinationType === "international" ? "text-white" : "text-purple-600"}`} />
                <h3 className="font-bold text-xl mb-2">
                  {t("hero.international")}
                </h3>
                <p className={formData.destinationType === "international" ? "text-purple-100" : "text-slate-600"}>{t("hero.internationalDesc")}</p>
              </button>
            </div>
            {formData.destinationType && (
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-semibold mb-2">
                  {t("customPackage.destinationLabel")}
                </label>
                <div className="flex flex-col gap-3">
                  {formData.destinationType === "domestic" ? (
                    <select
                      value={formData.destination}
                      onChange={(e) => handleRegionSelect(e.target.value)}
                      className="w-full px-4 py-3 border border-sky-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="">{t("customPackage.selectRegionPlaceholder")}</option>
                      {uzbekistanRegions.map((region) => (
                        <option key={region.key} value={region.key}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        placeholder={t("customPackage.destinationPlaceholder")}
                        value={formData.destination}
                        onChange={(e) => updateDestination(e.target.value)}
                        className="w-full px-4 py-3 border border-sky-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                      <button
                        onClick={handleUseCurrentLocation}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-white shadow-lg shadow-cyan-300/30 hover:from-blue-700 hover:to-cyan-600 transition"
                      >
                        {t("customPackage.useLocation")}
                      </button>
                    </div>
                  )}
                </div>

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
                  <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">{t("chat.aiInfo")}</span>
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
            )}
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
        const budgetOptions = [
          { key: "budget", label: t("customPackage.budgetOptions.budget"), range: "$100–500/kun" },
          { key: "mid-range", label: t("customPackage.budgetOptions.midRange"), range: "$500–1500/kun" },
          { key: "luxury", label: t("customPackage.budgetOptions.luxury"), range: "$1500+/kun" },
        ];
        const isCustomBudget = formData.budget.startsWith("$") && !budgetOptions.some(b => b.label === formData.budget);

        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("customPackage.step4")}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {budgetOptions.map((budget) => (
                <button
                  key={budget.key}
                  onClick={() => { setFormData({ ...formData, budget: budget.label }); setCustomBudgetAmount(""); }}
                  className={`p-6 rounded-[1.75rem] border transition-all shadow-sm bg-white hover:-translate-y-0.5 hover:shadow-lg ${
                      formData.budget === budget.label
                        ? "border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"
                        : "border-slate-200 text-slate-700"
                    }`}
                >
                  <DollarSign className={`w-8 h-8 mb-3 mx-auto ${formData.budget === budget.label ? "text-white" : "text-blue-600"}`} />
                  <h3 className="font-bold text-lg">{budget.label}</h3>
                  <p className={`text-xs mt-1 ${formData.budget === budget.label ? "text-white/80" : "text-slate-400"}`}>{budget.range}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-sm text-slate-400">yoki aniq summa</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <div className={`rounded-[1.75rem] border p-5 space-y-4 transition-all ${isCustomBudget ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-lg">$</span>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  placeholder="500"
                  value={customBudgetAmount}
                  onChange={(e) => {
                    setCustomBudgetAmount(e.target.value);
                    setFormData({ ...formData, budget: e.target.value ? `$${e.target.value}` : "" });
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                />
              </div>
              <input
                type="range"
                min={50}
                max={10000}
                step={50}
                value={customBudgetAmount ? Number(customBudgetAmount) : 500}
                onChange={(e) => {
                  setCustomBudgetAmount(e.target.value);
                  setFormData({ ...formData, budget: `$${e.target.value}` });
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>$50</span>
                <span className="font-semibold text-blue-600">{customBudgetAmount ? `$${Number(customBudgetAmount).toLocaleString()}` : ""}</span>
                <span>$10,000</span>
              </div>
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
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
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
                        ? "border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"
                        : "border-slate-200 text-slate-700 bg-white hover:-translate-y-0.5 hover:shadow-lg"
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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-600" />
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
                      <span className="text-sm font-semibold text-purple-600">DeepSeek AI</span>
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
                    <span className="text-slate-500">Taxminiy narx:</span>
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

              {itineraryError && (
                <p className="text-sm text-red-500 mb-3 text-center">{itineraryError}</p>
              )}
              <button
                onClick={handleGenerateCustomPackage}
                disabled={itineraryLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-[1.5rem] hover:shadow-xl transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Sparkles className="w-5 h-5" />
                Kun tartibini yaratish
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const typeIcon = (type: string) => {
    if (type === "food") return <Utensils className="w-4 h-4" />;
    if (type === "hotel") return <BedDouble className="w-4 h-4" />;
    if (type === "transport") return <Car className="w-4 h-4" />;
    return <Navigation className="w-4 h-4" />;
  };
  const typeColor = (type: string) => {
    if (type === "food") return "bg-orange-100 text-orange-600 border-orange-200";
    if (type === "hotel") return "bg-purple-100 text-purple-600 border-purple-200";
    if (type === "transport") return "bg-blue-100 text-blue-600 border-blue-200";
    return "bg-emerald-100 text-emerald-600 border-emerald-200";
  };

  if (selectedVariant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full mb-3 text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4" /> {selectedVariant.emoji} {selectedVariant.theme}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{selectedVariant.title}</h1>
            <p className="text-slate-500 mt-1">{destinationLabel} · {formData.days} kun · {formData.travelers} kishi</p>
          </div>

          <div className="space-y-6 mb-8">
            {selectedVariant.days.map((day: ItineraryDay) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.day * 0.08 }}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {day.day}
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium">{day.day}-kun</div>
                    <div className="text-white font-bold">{day.title}</div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {day.items.map((item: ItineraryItem, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 ${typeColor(item.type)}`}>
                          {typeIcon(item.type)}
                        </div>
                        {idx < day.items.length - 1 && <div className="w-px h-6 bg-slate-100 mt-1" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{item.time}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800">{item.place}</div>
                        {item.dish && (
                          <div className="text-sm text-orange-600 font-medium mt-0.5">🍽 {item.dish}</div>
                        )}
                        {item.note && (
                          <div className="text-sm text-slate-500 mt-0.5">{item.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> Dashboard'ga saqlash
            </button>
            <button
              onClick={() => setSelectedVariant(null)}
              className="flex-1 border border-blue-200 bg-white text-blue-600 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Boshqa variant tanlash
            </button>
            <button
              onClick={() => { setItineraryVariants(null); setSelectedVariant(null); setPlanSelected(false); }}
              className="flex-1 border border-slate-200 bg-white text-slate-700 py-4 rounded-2xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Yangi tur yaratish
            </button>
          </div>
          <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleGenerateCustomPackage} />
        </div>
      </div>
    );
  }

  if (itineraryVariants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full mb-3 text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4" /> AI 6 ta Variant Tayyorladi
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">O'zingizga yoqqan variantni tanlang</h1>
            <p className="text-slate-500 mt-1">{destinationLabel} · {formData.days} kun · {formData.travelers} kishi</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {itineraryVariants.map((variant, i) => (
              <motion.button
                key={variant.id}
                onClick={() => handleSelectVariant(variant)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="text-left bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="text-4xl mb-3">{variant.emoji}</div>
                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  Variant {i + 1}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1 leading-snug">{variant.theme}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{variant.description}</p>
                <div className="space-y-1">
                  {variant.days[0]?.items.slice(0, 3).map((item: ItineraryItem, idx: number) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {item.place}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Bu variantni tanlash <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => { setItineraryVariants(null); setPlanSelected(false); }}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Yangi tur yaratish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (itineraryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="font-semibold text-slate-700">AI kun tartibini tayyorlamoqda...</span>
          </div>
          <div className="flex justify-center gap-1 mt-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (!planSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 py-12 relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-16 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full mb-4 shadow-lg text-sm font-semibold">
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 sm:px-6 py-2 rounded-full mb-4 shadow-lg shadow-cyan-200/40 text-sm sm:text-base">
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
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
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
              onClick={handleGenerateCustomPackage}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5" />
              {t("customPackage.generate")}
            </button>
          )}
        </div>
      </div>
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleGenerateCustomPackage} />
    </div>
  );
}
