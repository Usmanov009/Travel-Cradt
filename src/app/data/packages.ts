export type PackageType = "domestic" | "international";

import { withPackageMedia } from "./packageMedia";

export interface TravelPackage {
  id: number;
  type: PackageType;
  category: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  included: string[];
  country?: string;
  hotel?: string;
  flightIncluded?: boolean;
  vibe?: string;
  video?: string;
  interests?: string[];
  partners?: string[];
  images?: string[];
  companyId?: number;
  companyName?: string;
  companyLogo?: string;
  translations?: {
    uz?: { title?: string; description?: string; vibe?: string; duration?: string };
    ru?: { title?: string; description?: string; vibe?: string; duration?: string };
  };
}

export const domesticPackages: TravelPackage[] = [
  {
    id: 1,
    type: "domestic",
    category: "historical",
    title: "Samarkand Heritage Tour",
    description: "Explore the ancient Silk Road city with its stunning architecture",
    image: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=800&h=600&fit=crop",
    duration: "3 days",
    price: 250,
    rating: 4.9,
    included: ["Hotel", "Breakfast", "Guide", "Transportation", "Museum Tickets"],
    vibe: "Feel the ancient Silk Road energy with majestic madrasahs, vibrant bazaars, and timeless calm.",
    video: "https://www.youtube.com/embed/CoQ0-4FHEyU",
    translations: {
      uz: {
        title: "Samarkand Meros Turi",
        description: "Ajoyib me'morchiligiga ega qadimiy Ipak Yo'li shahrini kashf eting",
        vibe: "Katta madrasalar, jonli bozorlar va abadiy osoyishtalik bilan qadimiy Ipak Yo'li energiyasini his eting.",
        duration: "3 kun",
      },
      ru: {
        title: "Тур Наследия Самарканда",
        description: "Исследуйте древний город Шёлкового пути с потрясающей архитектурой",
        vibe: "Почувствуйте энергию древнего Шёлкового пути с величественными медресе, яркими базарами и вечным спокойствием.",
        duration: "3 дня",
      },
    },
  },
  {
    id: 2,
    type: "domestic",
    category: "historical",
    title: "Bukhara Historical Journey",
    description: "Visit the ancient city center and discover medieval architecture",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    duration: "2 days",
    price: 200,
    rating: 4.8,
    included: ["Hotel", "Breakfast", "Guide", "Transportation"],
    vibe: "Experience warm bazaar streets, peaceful madrasa courtyards, and the cultural heart of Uzbekistan.",
    video: "https://www.youtube.com/embed/YtGl-eESRZM",
    translations: {
      uz: {
        title: "Buxoro Tarixiy Sayohati",
        description: "Qadimiy shahar markazini ziyorat qiling va o'rta asrlar me'morchiligini kashf eting",
        vibe: "Iliq bozor ko'chalari, tinch madrasa hovlilari va O'zbekistonning madaniy qalbini his eting.",
        duration: "2 kun",
      },
      ru: {
        title: "Историческое Путешествие в Бухару",
        description: "Посетите исторический центр древнего города и откройте средневековую архитектуру",
        vibe: "Почувствуйте тёплые улицы базара, спокойные дворы медресе и культурное сердце Узбекистана.",
        duration: "2 дня",
      },
    },
  },
  {
    id: 3,
    type: "domestic",
    category: "historical",
    title: "Khiva Fortress Experience",
    description: "Walk through the ancient walled city of Khiva",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    duration: "2 days",
    price: 220,
    rating: 4.7,
    included: ["Hotel", "Breakfast", "Guide", "Entry Tickets"],
    vibe: "Feel like you stepped into a living museum as the earth-toned walls glow at sunset.",
    video: "https://www.youtube.com/embed/7j0wpsMZTzk",
    translations: {
      uz: {
        title: "Xiva Qal'asi Tajribasi",
        description: "Xivaning qadimiy devorli shahrini kezib chiqing",
        vibe: "Quyosh botishida tuproq rangli devorlar yonib turganda tirik muzeiga qadam qo'yganingizdek his eting.",
        duration: "2 kun",
      },
      ru: {
        title: "Знакомство с Крепостью Хивы",
        description: "Прогуляйтесь по древнему обнесённому стеной городу Хива",
        vibe: "Почувствуйте, как будто шагнули в живой музей, когда земляные стены светятся на закате.",
        duration: "2 дня",
      },
    },
  },
  {
    id: 4,
    type: "domestic",
    category: "nature",
    title: "Chimgan Mountain Adventure",
    description: "Enjoy the breathtaking mountain landscapes and fresh air",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    duration: "2 days",
    price: 180,
    rating: 4.8,
    included: ["Hotel", "Meals", "Cable Car", "Guide"],
    vibe: "Breathe crisp mountain air, hike pine-lined trails, and discover a lively alpine atmosphere.",
    video: "https://www.youtube.com/embed/njbWO4U-xUs",
    translations: {
      uz: {
        title: "Chimgan Tog' Sarguzashti",
        description: "Nafas oluvchi tog' manzaralari va toza havoni his eting",
        vibe: "Toza tog' havosini nafas oling, qarag'ay o'rmonli yo'llardan yuring va jonli alp muhitini kashf eting.",
        duration: "2 kun",
      },
      ru: {
        title: "Горное Приключение в Чимгане",
        description: "Насладитесь захватывающими горными пейзажами и свежим воздухом",
        vibe: "Дышите чистым горным воздухом, гуляйте по сосновым тропам и наслаждайтесь живой альпийской атмосферой.",
        duration: "2 дня",
      },
    },
  },
  {
    id: 5,
    type: "domestic",
    category: "nature",
    title: "Charvak Lake Retreat",
    description: "Relax by the beautiful turquoise lake surrounded by mountains",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop",
    duration: "3 days",
    price: 300,
    rating: 4.9,
    included: ["Resort", "All Meals", "Water Activities", "Transportation"],
    translations: {
      uz: {
        title: "Charvak Ko'li Dam Olish Maskani",
        description: "Tog'lar orasidagi go'zal ko'k ko'l yonida dam oling",
        duration: "3 kun",
      },
      ru: {
        title: "Отдых у Чарвакского Озера",
        description: "Отдохните у прекрасного бирюзового озера среди гор",
        duration: "3 дня",
      },
    },
  },
  {
    id: 6,
    type: "domestic",
    category: "nature",
    title: "Amirsoy Ski Resort",
    description: "Winter sports and activities in the mountains",
    image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop",
    duration: "2 days",
    price: 350,
    rating: 4.7,
    included: ["Hotel", "Ski Pass", "Equipment", "Instructor"],
    translations: {
      uz: {
        title: "Amirsoy Ski Kurorти",
        description: "Tog'larda qishki sport va tadbirlar",
        duration: "2 kun",
      },
      ru: {
        title: "Горнолыжный Курорт Амирсай",
        description: "Зимние виды спорта и активности в горах",
        duration: "2 дня",
      },
    },
  },
  {
    id: 7,
    type: "domestic",
    category: "pilgrimage",
    title: "Imam Bukhari Complex Tour",
    description: "Visit the sacred site of the great Islamic scholar",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=600&fit=crop",
    duration: "1 day",
    price: 80,
    rating: 4.9,
    included: ["Transportation", "Guide", "Lunch"],
    translations: {
      uz: {
        title: "Imom Buxoriy Majmuasi Ziyorati",
        description: "Buyuk islom olimining muqaddas joyiga ziyorat qiling",
        duration: "1 kun",
      },
      ru: {
        title: "Тур к Комплексу Имама Бухари",
        description: "Посетите священное место великого исламского учёного",
        duration: "1 день",
      },
    },
  },
  {
    id: 8,
    type: "domestic",
    category: "pilgrimage",
    title: "Bahouddin Naqshband Complex",
    description: "Explore the spiritual center of Sufism in Central Asia",
    image: "https://images.unsplash.com/photo-1564769610456-1f7a3f77d3cf?w=800&h=600&fit=crop",
    duration: "1 day",
    price: 90,
    rating: 4.8,
    included: ["Transportation", "Guide", "Entrance"],
    translations: {
      uz: {
        title: "Bahouddin Naqshband Majmuasi",
        description: "Markaziy Osiyodagi tasavvuf ma'naviy markazini kashf eting",
        duration: "1 kun",
      },
      ru: {
        title: "Комплекс Бахауддина Накшбанда",
        description: "Откройте духовный центр суфизма в Центральной Азии",
        duration: "1 день",
      },
    },
  },
  {
    id: 9,
    type: "domestic",
    category: "family",
    title: "Tashkent Family Fun Package",
    description: "Perfect for families with kids - parks, zoo, and entertainment",
    image: "https://images.unsplash.com/photo-1503457574462-bd27054394c1?w=800&h=600&fit=crop",
    duration: "2 days",
    price: 280,
    rating: 4.6,
    included: ["Hotel", "Breakfast", "Park Tickets", "Transportation"],
    translations: {
      uz: {
        title: "Toshkent Oilaviy Paket",
        description: "Bolali oilalar uchun ideal — bog'lar, hayvonot bog'i va ko'ngilochar joy",
        duration: "2 kun",
      },
      ru: {
        title: "Семейный Пакет Ташкент",
        description: "Идеально для семей с детьми — парки, зоопарк и развлечения",
        duration: "2 дня",
      },
    },
  },
  {
    id: 10,
    type: "domestic",
    category: "weekend",
    title: "Weekend Getaway to Zaamin",
    description: "Perfect weekend escape to the mountains",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    duration: "2 days",
    price: 150,
    rating: 4.7,
    included: ["Hotel", "Meals", "Hiking Guide"],
    translations: {
      uz: {
        title: "Zaaminга Hafta Oxiri Sayohati",
        description: "Tog'larga mukammal hafta oxiri dam olish joyi",
        duration: "2 kun",
      },
      ru: {
        title: "Отдых в Зааминском Заповеднике",
        description: "Идеальный отдых в горах на выходных",
        duration: "2 дня",
      },
    },
  },
  {
    id: 11,
    type: "domestic",
    category: "adventure",
    title: "Nuratau Mountains Trekking",
    description: "Multi-day trekking adventure through pristine mountains",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
    duration: "4 days",
    price: 400,
    rating: 4.8,
    included: ["Camping", "All Meals", "Guide", "Equipment"],
    translations: {
      uz: {
        title: "Nurota Tog'lari Trekingi",
        description: "Toza tog'lar orqali ko'p kunlik trekking sarguzashti",
        duration: "4 kun",
      },
      ru: {
        title: "Треккинг в Горах Нуратау",
        description: "Многодневное треккинговое приключение через первозданные горы",
        duration: "4 дня",
      },
    },
  },
  {
    id: 12,
    type: "domestic",
    category: "adventure",
    title: "Desert Safari - Kyzylkum",
    description: "Explore the vast desert landscape on a thrilling safari",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop",
    duration: "3 days",
    price: 380,
    rating: 4.6,
    included: ["Yurt Stay", "Meals", "Camel Ride", "Guide"],
    translations: {
      uz: {
        title: "Qizilqum Cho'l Safari",
        description: "Hayajonli safari davomida keng cho'l landshaftini kashf eting",
        duration: "3 kun",
      },
      ru: {
        title: "Пустынное Сафари — Кызылкум",
        description: "Исследуйте просторный пустынный пейзаж в захватывающем сафари",
        duration: "3 дня",
      },
    },
  },
  {
    id: 13,
    type: "domestic",
    category: "custom",
    title: "Mo'oz Paketimni Yaratish",
    description:
      "O'zingizga mos, maxsus sayohat paketini birga yaratish — marshrutdan marketinggacha.",
    image:
      "https://images.unsplash.com/photo-1508973378-6e2b2a3d6f0f?w=800&h=600&fit=crop",
    duration: "Custom",
    price: 0,
    rating: 0,
    included: ["Konsultatsiya", "Marshrut loyihalash", "Marketing qo'llab-quvvatlash"],
    interests: ["Mahalliy paket yaratish", "Startap/mahalliy biznes"],
    partners: ["TravelCraft jamoasi", "Mahalliy gidlar", "Hamkor agentliklar"],
    vibe:
      "Siz bilan birga noyob va sotiladigan paket yaratamiz: konsept, narxlash va targ'ibot.",
    translations: {
      ru: {
        title: "Создать Свой Пакет",
        description: "Создайте индивидуальный туристический пакет вместе с нами — от маршрута до маркетинга.",
        duration: "По запросу",
      },
    },
  },
];

export const internationalPackages: TravelPackage[] = [
  {
    id: 1,
    type: "international",
    category: "beach",
    title: "Antalya Beach Resort",
    description: "All-inclusive luxury beach resort with stunning Mediterranean views",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",
    duration: "7 days",
    price: 1200,
    rating: 4.9,
    country: "Turkey",
    hotel: "5-Star All-Inclusive Resort",
    flightIncluded: true,
    included: ["Flight", "Hotel", "All Meals", "Beach Access", "Spa"],
    vibe: "Relax in a Mediterranean seaside oasis where luxury meets vibrant coastal culture.",
    video: "https://www.youtube.com/embed/Q03bFfO-oHE",
    translations: {
      uz: {
        title: "Antalya Plyaj Kurorти",
        description: "O'rta dengiz manzarasi bilan hashamatli all-inclusive plyaj kurorти",
        vibe: "Hashamat va jonli qirg'oq madaniyati o'zaro uyg'un bo'lgan O'rta dengiz oromgohida dam oling.",
        duration: "7 kun",
      },
      ru: {
        title: "Пляжный Курорт Анталия",
        description: "Роскошный курорт all-inclusive с захватывающим видом на Средиземное море",
        vibe: "Отдохните в средиземноморском оазисе, где роскошь сочетается с яркой прибрежной культурой.",
        duration: "7 дней",
      },
    },
  },
  {
    id: 2,
    type: "international",
    category: "luxury",
    title: "Dubai Luxury Experience",
    description: "Experience the pinnacle of luxury in the UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
    duration: "5 days",
    price: 1800,
    rating: 5.0,
    country: "Dubai (UAE)",
    hotel: "Burj Al Arab",
    flightIncluded: true,
    included: ["Flight", "5-Star Hotel", "Breakfast", "Desert Safari", "City Tour"],
    vibe: "Feel the glamorous skyline, endless luxury, and high-energy desert adventure.",
    video: "https://www.youtube.com/embed/wJzETxzNP3o",
    translations: {
      uz: {
        title: "Dubai Hashamat Tajribasi",
        description: "BAAdagi hashamatning cho'qqisini boshdan kechiring",
        vibe: "Ajoyib osmono'par binolar, cheksiz hashamat va qizg'in cho'l sarguzashtlarini his eting.",
        duration: "5 kun",
      },
      ru: {
        title: "Роскошный Опыт Дубая",
        description: "Испытайте вершину роскоши в Объединённых Арабских Эмиратах",
        vibe: "Почувствуйте блистательный горизонт, бесконечную роскошь и захватывающее пустынное приключение.",
        duration: "5 дней",
      },
    },
  },
  {
    id: 3,
    type: "international",
    category: "beach",
    title: "Phuket Paradise",
    description: "Tropical beach paradise with crystal-clear waters",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop",
    duration: "7 days",
    price: 1100,
    rating: 4.8,
    country: "Thailand",
    hotel: "Beach Resort & Spa",
    flightIncluded: true,
    included: ["Flight", "Hotel", "Breakfast", "Island Tours", "Spa"],
    vibe: "Enjoy warm sands, turquoise waters, and a laid-back island energy.",
    video: "https://www.youtube.com/embed/PLxAqYFJ2dk",
    translations: {
      uz: {
        title: "Phuket Jannat",
        description: "Billur toza suvli tropik plyaj jannati",
        vibe: "Iliq qumlar, ko'k suvlar va xotirjam orol muhitidan bahramand bo'ling.",
        duration: "7 kun",
      },
      ru: {
        title: "Рай Пхукет",
        description: "Тропический пляжный рай с кристально чистой водой",
        vibe: "Наслаждайтесь тёплым песком, бирюзовой водой и расслабленной островной атмосферой.",
        duration: "7 дней",
      },
    },
  },
  {
    id: 4,
    type: "international",
    category: "religious",
    title: "Umrah Package - Deluxe",
    description: "Complete Umrah package with premium accommodations",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop",
    duration: "10 days",
    price: 2500,
    rating: 4.9,
    country: "Saudi Arabia",
    hotel: "5-Star Hotels in Makkah & Madinah",
    flightIncluded: true,
    included: ["Flight", "Hotels", "Meals", "Transport", "Ziyarah Tours"],
    vibe: "A spiritual and reverent atmosphere with premium comfort and meaningful rituals.",
    video: "https://www.youtube.com/embed/a4oQdhR0CwI",
    translations: {
      uz: {
        title: "Umra Paketi — Delux",
        description: "Premium yotoqxonalar bilan to'liq Umra paketi",
        vibe: "Premium qulaylik va mazmunli ibodatlar bilan ma'naviy va ehtiromli muhit.",
        duration: "10 kun",
      },
      ru: {
        title: "Пакет Умры — Делюкс",
        description: "Полный пакет Умры с премиальным проживанием",
        vibe: "Духовная и благоговейная атмосфера с премиальным комфортом и значимыми ритуалами.",
        duration: "10 дней",
      },
    },
  },
  {
    id: 5,
    type: "international",
    category: "beach",
    title: "Bali Island Escape",
    description: "Discover the beauty and culture of Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
    duration: "6 days",
    price: 950,
    rating: 4.7,
    country: "Indonesia",
    hotel: "Beach Villa Resort",
    flightIncluded: true,
    included: ["Flight", "Villa", "Breakfast", "Cultural Tours", "Temple Visits"],
    translations: {
      uz: {
        title: "Bali Oroli Sayohati",
        description: "Indoneziyaning go'zalligi va madaniyatini kashf eting",
        duration: "6 kun",
      },
      ru: {
        title: "Побег на Остров Бали",
        description: "Откройте красоту и культуру Индонезии",
        duration: "6 дней",
      },
    },
  },
  {
    id: 6,
    type: "international",
    category: "family",
    title: "Istanbul Family Adventure",
    description: "Perfect family package exploring Turkish culture and history",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=600&fit=crop",
    duration: "5 days",
    price: 900,
    rating: 4.8,
    country: "Turkey",
    hotel: "Family-Friendly Hotel",
    flightIncluded: true,
    included: ["Flight", "Hotel", "Breakfast", "City Tours", "Bosphorus Cruise"],
    translations: {
      uz: {
        title: "Istanbul Oilaviy Sarguzashti",
        description: "Turk madaniyati va tarixini o'rganish uchun mukammal oilaviy paket",
        duration: "5 kun",
      },
      ru: {
        title: "Семейное Приключение в Стамбуле",
        description: "Идеальный семейный пакет для знакомства с турецкой культурой и историей",
        duration: "5 дней",
      },
    },
  },
  {
    id: 7,
    type: "international",
    category: "luxury",
    title: "Maldives Overwater Villa",
    description: "Ultimate luxury in an overwater villa paradise",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop",
    duration: "7 days",
    price: 3500,
    rating: 5.0,
    country: "Maldives",
    hotel: "Luxury Overwater Villa Resort",
    flightIncluded: true,
    included: ["Flight", "Villa", "All-Inclusive", "Water Sports", "Spa"],
    translations: {
      uz: {
        title: "Maldiv Suv Ustidagi Villa",
        description: "Suv ustidagi villa jannati — mutlaq hashamat",
        duration: "7 kun",
      },
      ru: {
        title: "Вилла на Воде Мальдивы",
        description: "Высшая роскошь на вилле над водой в райском месте",
        duration: "7 дней",
      },
    },
  },
  {
    id: 8,
    type: "international",
    category: "shopping",
    title: "Dubai Shopping Festival",
    description: "Shop till you drop at the world's biggest shopping festival",
    image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&h=600&fit=crop",
    duration: "4 days",
    price: 1200,
    rating: 4.7,
    country: "Dubai (UAE)",
    hotel: "4-Star City Hotel",
    flightIncluded: true,
    included: ["Flight", "Hotel", "Breakfast", "Mall Tours", "Shopping Guide"],
    translations: {
      uz: {
        title: "Dubai Xarid Festivali",
        description: "Dunyodagi eng katta xarid festivalida xarid qiling",
        duration: "4 kun",
      },
      ru: {
        title: "Торговый Фестиваль Дубая",
        description: "Шопинг на крупнейшем торговом фестивале в мире",
        duration: "4 дня",
      },
    },
  },
  {
    id: 9,
    type: "international",
    category: "honeymoon",
    title: "Santorini Romance",
    description: "Perfect honeymoon destination with breathtaking sunsets",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop",
    duration: "6 days",
    price: 2200,
    rating: 5.0,
    country: "Greece",
    hotel: "Luxury Cave Hotel with Caldera View",
    flightIncluded: true,
    included: ["Flight", "Hotel", "Breakfast", "Sunset Cruise", "Wine Tasting"],
    translations: {
      uz: {
        title: "Santorini Romantikasi",
        description: "Nafas oluvchi quyosh botishi manzaralari bilan mukammal asal oyi manzili",
        duration: "6 kun",
      },
      ru: {
        title: "Романтика Санторини",
        description: "Идеальное место для медового месяца с захватывающими закатами",
        duration: "6 дней",
      },
    },
  },
  {
    id: 10,
    type: "international",
    category: "beach",
    title: "Sharm El Sheikh Diving",
    description: "Explore the Red Sea with world-class diving",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop",
    duration: "6 days",
    price: 850,
    rating: 4.6,
    country: "Egypt",
    hotel: "Beach Resort",
    flightIncluded: true,
    included: ["Flight", "Hotel", "All-Inclusive", "Diving", "Desert Safari"],
    translations: {
      uz: {
        title: "Sharm El-Shayx Sho'ng'ini",
        description: "Jahon darajasidagi sho'ng'in bilan Qizil dengizni kashf eting",
        duration: "6 kun",
      },
      ru: {
        title: "Дайвинг в Шарм-эль-Шейхе",
        description: "Исследуйте Красное море с дайвингом мирового класса",
        duration: "6 дней",
      },
    },
  },
  {
    id: 11,
    type: "international",
    category: "adventure",
    title: "Kuala Lumpur Explorer",
    description: "Urban adventure in Malaysia's vibrant capital",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
    duration: "5 days",
    price: 800,
    rating: 4.7,
    country: "Malaysia",
    hotel: "4-Star City Hotel",
    flightIncluded: true,
    included: ["Flight", "Hotel", "Breakfast", "City Tours", "Theme Parks"],
    translations: {
      uz: {
        title: "Kuala Lumpur Kashfiyotchisi",
        description: "Malayziyaning jonli poytaxtida shahar sarguzashti",
        duration: "5 kun",
      },
      ru: {
        title: "Исследователь Куала-Лумпура",
        description: "Городское приключение в яркой столице Малайзии",
        duration: "5 дней",
      },
    },
  },
  {
    id: 12,
    type: "international",
    category: "family",
    title: "Doha Family Fun",
    description: "Modern city experience with traditional Arabian hospitality",
    image: "https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?w=800&h=600&fit=crop",
    duration: "4 days",
    price: 1100,
    rating: 4.8,
    country: "Qatar",
    hotel: "5-Star Family Resort",
    flightIncluded: true,
    included: ["Flight", "Hotel", "Breakfast", "Desert Safari", "Souq Visit"],
    translations: {
      uz: {
        title: "Doha Oilaviy Dam Olish",
        description: "An'anaviy arab mehmondo'stligi bilan zamonaviy shahar tajribasi",
        duration: "4 kun",
      },
      ru: {
        title: "Семейный Отдых в Дохе",
        description: "Современный городской опыт с традиционным арабским гостеприимством",
        duration: "4 дня",
      },
    },
  },
];

export const allPackages = [...domesticPackages, ...internationalPackages].map(withPackageMedia);

export function getPackageBySlug(type: PackageType, id: number) {
  return allPackages.find((item) => item.type === type && item.id === id);
}

export function getPackagesByType(type: PackageType) {
  return allPackages.filter((item) => item.type === type);
}
