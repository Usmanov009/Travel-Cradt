export type ComboCategory =
  | "domestic"
  | "europe"
  | "asia"
  | "middle-east"
  | "america"
  | "luxury"
  | "family"
  | "adventure"
  | "honeymoon";

export interface ComboCountryStop {
  name: string;
  flag: string;
  image: string;
}

export interface ComboTour {
  id: number;
  slug: string;
  title: string;
  description: string;
  vibe: string;
  duration: string;
  days: number;
  price: number;
  rating: number;
  categories: ComboCategory[];
  countries: ComboCountryStop[];
  highlights: string[];
  included: string[];
  images: string[];
}

const u = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

export const COMBO_CATEGORY_LABELS: Record<ComboCategory, string> = {
  domestic: "Ichki",
  europe: "Yevropa",
  asia: "Osiyo",
  "middle-east": "Yaqin Sharq",
  america: "Amerika",
  luxury: "Hashamatli",
  family: "Oilaviy",
  adventure: "Sarguzasht",
  honeymoon: "Asal oyi",
};

export const COMBO_TOURS: ComboTour[] = [
  {
    id: 10,
    slug: "samarqand-buxoro-heritage",
    title: "Samarqand + Buxoro",
    description:
      "O'zbekistonning eng mashhur ikkita Ipak Yo'li shahrini bir sayohatda kashf eting — qadimiy tarix va madaniyat.",
    vibe: "Registon maydonidan Buxoro qal'asigacha — Ipak yo'lining eng yorqin ikki manzili.",
    duration: "4 kun",
    days: 4,
    price: 108,
    rating: 4.9,
    categories: ["domestic", "family"],
    countries: [
      { name: "Samarqand", flag: "🇺🇿", image: u("photo-1568605117036-5fe5e7bab0b7") },
      { name: "Buxoro", flag: "🇺🇿", image: u("photo-1548013146-72479768bada") },
    ],
    highlights: [
      "Registon maydoni va Amir Temur maqbarasi",
      "Buxorodagi Kalyon minorasi va Ark qal'asi",
      "Shohi-Zinda ansambli va Chor-Bakr",
      "Milliy ta'mlar va madaniy dasturlar",
    ],
    included: ["Transport", "Mehmonxonalar", "Nonushta", "Gid xizmati", "Muzey kirishlari"],
    images: [u("photo-1568605117036-5fe5e7bab0b7"), u("photo-1548013146-72479768bada")],
  },
  {
    id: 11,
    slug: "samarqand-toshkent-discovery",
    title: "Samarqand + Toshkent",
    description:
      "Poytaxtning zamonaviy joziba va Samarqandning abadiy go'zalligini birlashtirgan mukammal qisqa sayohat.",
    vibe: "Toshkentning zamonaviy masjidlari va Samarqandning Gur-e-Amir maqbarasi — O'zbekiston yuragi.",
    duration: "3 kun",
    days: 3,
    price: 73,
    rating: 4.8,
    categories: ["domestic", "family"],
    countries: [
      { name: "Toshkent", flag: "🇺🇿", image: u("photo-1548013146-72479768bada") },
      { name: "Samarqand", flag: "🇺🇿", image: u("photo-1568605117036-5fe5e7bab0b7") },
    ],
    highlights: [
      "Toshkentdagi Chorsu bozori va Xasti Imom majmuasi",
      "Samarqanddagi Registon maydoni",
      "Gur-e-Amir maqbarasi va Bibixonim masjidi",
      "Milliy ta'mlar va madaniy dasturlar",
    ],
    included: ["Transport", "Mehmonxonalar", "Nonushta", "Gid xizmati"],
    images: [u("photo-1548013146-72479768bada"), u("photo-1568605117036-5fe5e7bab0b7")],
  },
  {
    id: 7,
    slug: "tashkent-samarkand-golden-route",
    title: "Oltin Yo'l: Toshkent & Samarqand",
    description:
      "Zamonaviy poytaxtdan qadimiy Samarqandgacha — O'zbekistonning ikkita eng muhim shahrida tarixiy sayohat.",
    vibe: "Qadimiy tarix va zamonaviy shahar hayoti uyg'unlashgan ichki sayohat.",
    duration: "5 kun",
    days: 5,
    price: 350,
    rating: 4.9,
    categories: ["domestic", "family"],
    countries: [
      { name: "Toshkent", flag: "🇺🇿", image: u("photo-1548013146-72479768bada") },
      { name: "Samarqand", flag: "🇺🇿", image: u("photo-1568605117036-5fe5e7bab0b7") },
    ],
    highlights: [
      "Registon maydoni va Amir Temur maqbarasi",
      "Toshkentdagi Chorsu bozori",
      "Samarqanddagi Shohi-Zinda ansambli",
      "Milliy ta'mlar va madaniy dasturlar",
    ],
    included: ["Transport", "Mehmonxonalar", "Nonushta", "Gid xizmati", "Muzey kirishlari"],
    images: [u("photo-1548013146-72479768bada"), u("photo-1568605117036-5fe5e7bab0b7")],
  },
  {
    id: 8,
    slug: "bukhara-khiva-silk-road",
    title: "Ipak Yo'li: Buxoro & Xiva",
    description:
      "Ochiq osmon muzeyi Buxorodan qadimiy Xiva qal'asigacha — Ipak yo'lining eng go'zal ikki manzili.",
    vibe: "Qadimiy devorlar, karvonsaroylar va sharqona mehmondo'stlik.",
    duration: "6 kun",
    days: 6,
    price: 420,
    rating: 4.8,
    categories: ["domestic", "adventure"],
    countries: [
      { name: "Buxoro", flag: "🇺🇿", image: u("photo-1548013146-72479768bada") },
      { name: "Xiva", flag: "🇺🇿", image: u("photo-1568605117036-5fe5e7bab0b7") },
    ],
    highlights: [
      "Ichan-Qala qal'asi ichida sayohat",
      "Buxorodagi Kalyon minorasi",
      "Sharqona hammom va spa dasturlari",
      "Milliy konsert va ashula dasturlari",
    ],
    included: ["Transport", "Mehmonxonalar", "Nonushta", "Gid xizmati", "Konsertlar"],
    images: [u("photo-1548013146-72479768bada"), u("photo-1568605117036-5fe5e7bab0b7")],
  },
  {
    id: 9,
    slug: "uzbekistan-grand-tour",
    title: "O'zbekiston Katta Sayohati",
    description:
      "Toshkentdan Samarqand, Buxoro va Xivagacha — bitta safarda O'zbekistonning barcha tarixiy shaharlari.",
    vibe: "Mukammal tarixiy sayohat va madaniy immersiya.",
    duration: "10 kun",
    days: 10,
    price: 750,
    rating: 4.9,
    categories: ["domestic", "luxury"],
    countries: [
      { name: "Toshkent", flag: "🇺🇿", image: u("photo-1548013146-72479768bada") },
      { name: "Samarqand", flag: "🇺🇿", image: u("photo-1568605117036-5fe5e7bab0b7") },
    ],
    highlights: [
      "4 ta tarixiy shahar bo'ylab to'liq sayohat",
      "VIP mehmonxonalar va hashamatli transport",
      "Xususiy gidlar va maxsus dasturlar",
      "Milliy oshxona va madaniy kechalar",
    ],
    included: ["VIP Transport", "5-yulduz mehmonxonalar", "Nonushta", "Xususiy gid", "Barcha kirishlar"],
    images: [u("photo-1548013146-72479768bada"), u("photo-1568605117036-5fe5e7bab0b7")],
  },
  {
    id: 1,
    slug: "turkey-greece-mediterranean",
    title: "O'rta Dengiz Afsonasi",
    description:
      "Antalyaning quyoshli qirg'oqlaridan Santorinining oq-ko'k shaharchalarigacha — bitta safarda ikkita ajoyib O'rta dengiz mamlakati.",
    vibe: "Qadimiy tarix, quyoshli plyajlar va nafas oluvchi quyosh botishlari uyg'unlashgan Oʻrta dengiz sayohati.",
    duration: "9 kun",
    days: 9,
    price: 1750,
    rating: 4.9,
    categories: ["europe", "honeymoon"],
    countries: [
      { name: "Turkey", flag: "🇹🇷", image: u("photo-1524231757912-21f4fe3a7200") },
      { name: "Greece", flag: "🇬🇷", image: u("photo-1613395877344-13d4a8e0d49e") },
    ],
    highlights: [
      "Antalyada 5 yulduzli all-inclusive kurort",
      "Santorinida karst manzarali mehmonxona",
      "Quyosh botishida kruiz va sharob ta'mi",
      "Ikkala shaharda ham bepul shahar bo'ylab sayohat",
    ],
    included: ["2 ta xalqaro parvoz", "Mehmonxonalar", "Nonushta", "Transfer", "Gid xizmati"],
    images: [u("photo-1524231757912-21f4fe3a7200"), u("photo-1613395877344-13d4a8e0d49e")],
  },
  {
    id: 2,
    slug: "dubai-qatar-luxury",
    title: "Ko'rfaz Hashamati",
    description:
      "Dubaydagi osmono'par binolar va Dohaning zamonaviy me'morchiligi — ikkita hashamatli ko'rfaz shahrida VIP darajadagi dam olish.",
    vibe: "Cheksiz hashamat, cho'l sarguzashtlari va zamonaviy arab mehmondo'stligi.",
    duration: "7 kun",
    days: 7,
    price: 2200,
    rating: 4.8,
    categories: ["middle-east", "luxury"],
    countries: [
      { name: "Dubai (UAE)", flag: "🇦🇪", image: u("photo-1512453979798-5ea266f8880c") },
      { name: "Qatar", flag: "🇶🇦", image: u("photo-1604999565976-8913ad2ddb7c") },
    ],
    highlights: [
      "Burj Khalifa va Museum of the Future tashrifi",
      "Dubay cho'l safarisi tuyaqushlar bilan",
      "Doha Souq Waqif va milliy muzey",
      "5 yulduzli mehmonxonalarda VIP xizmat",
    ],
    included: ["2 ta xalqaro parvoz", "5-yulduz mehmonxonalar", "Nonushta", "Cho'l safari", "Shahar bo'ylab tur"],
    images: [u("photo-1512453979798-5ea266f8880c"), u("photo-1604999565976-8913ad2ddb7c")],
  },
  {
    id: 3,
    slug: "thailand-malaysia-explorer",
    title: "Janubi-Sharqiy Osiyo Sarguzashti",
    description:
      "Phuketning tropik plyajlaridan Kuala-Lumpurning zamonaviy shahar hayotigacha — Janubi-Sharqiy Osiyoning eng yorqin ikki yuzi.",
    vibe: "Tropik tabiat, jonli bozorlar va zamonaviy shahar energiyasi bir marshrutda.",
    duration: "9 kun",
    days: 9,
    price: 1550,
    rating: 4.7,
    categories: ["asia", "adventure"],
    countries: [
      { name: "Thailand", flag: "🇹🇭", image: u("photo-1552465011-b4e21bf6e79a") },
      { name: "Malaysia", flag: "🇲🇾", image: u("photo-1596422846543-75c6fc197f07") },
    ],
    highlights: [
      "Phuket orollari bo'ylab qayiqda sayohat",
      "Kuala-Lumpurdagi Petronas minoralari",
      "Mahalliy oshxona darslari",
      "Tropik orollarda suzish va sho'ng'in",
    ],
    included: ["2 ta xalqaro parvoz", "Mehmonxonalar", "Nonushta", "Orol turlari", "Shahar sayohati"],
    images: [u("photo-1552465011-b4e21bf6e79a"), u("photo-1596422846543-75c6fc197f07")],
  },
  {
    id: 4,
    slug: "thailand-indonesia-paradise",
    title: "Tropik Jannat: Tailand & Indoneziya",
    description:
      "Phuketning kristalldek toza suvlari va Balining ma'naviy ma'badlari — butun oila uchun mukammal tropik sayohat.",
    vibe: "Iliq qumlar, madaniy ma'badlar va oilaviy dam olish uchun ideal muhit.",
    duration: "10 kun",
    days: 10,
    price: 1650,
    rating: 4.8,
    categories: ["asia", "family"],
    countries: [
      { name: "Thailand", flag: "🇹🇭", image: u("photo-1552465011-b4e21bf6e79a") },
      { name: "Indonesia", flag: "🇮🇩", image: u("photo-1537996194471-e657df975ab4") },
    ],
    highlights: [
      "Phuketda oilaviy plyaj kurorti",
      "Bali villa va ma'bad tashriflari",
      "Bolalar uchun maxsus faoliyatlar",
      "Mahalliy madaniy dasturlar",
    ],
    included: ["2 ta xalqaro parvoz", "Villa va mehmonxona", "Nonushta", "Madaniy turlar", "Transfer"],
    images: [u("photo-1552465011-b4e21bf6e79a"), u("photo-1537996194471-e657df975ab4")],
  },
  {
    id: 5,
    slug: "maldives-greece-honeymoon",
    title: "Ikki Jannat: Maldiv & Santorini",
    description:
      "Suv ustidagi villalar va karst manzarali quyosh botishlari — asal oyi uchun dunyodagi eng romantik ikki manzil.",
    vibe: "Mutlaq hashamat, tinchlik va abadiy romantika uyg'unlashgan sayohat.",
    duration: "10 kun",
    days: 10,
    price: 4500,
    rating: 5.0,
    categories: ["luxury", "honeymoon"],
    countries: [
      { name: "Maldives", flag: "🇲🇻", image: u("photo-1514282401047-d79a71a590e8") },
      { name: "Greece", flag: "🇬🇷", image: u("photo-1613395877344-13d4a8e0d49e") },
    ],
    highlights: [
      "Suv ustidagi villada 5 kecha",
      "Santorinida karst manzarali suite",
      "Xususiy sunset kruiz",
      "Spa va massaj dasturlari",
    ],
    included: ["2 ta xalqaro parvoz", "Villa/Suite", "All-inclusive", "Spa", "Xususiy transfer"],
    images: [u("photo-1514282401047-d79a71a590e8"), u("photo-1613395877344-13d4a8e0d49e")],
  },
  {
    id: 6,
    slug: "egypt-qatar-heritage",
    title: "Qadimiylik va Zamonaviylik: Misr & Qatar",
    description:
      "Qizil dengizdagi sho'ng'in sarguzashtlaridan Dohaning zamonaviy me'morchiligigacha — tarix va zamonaviylik uyg'unligi.",
    vibe: "Qadimiy sirlar va zamonaviy shahar hayotining kontrasti.",
    duration: "8 kun",
    days: 8,
    price: 1650,
    rating: 4.6,
    categories: ["middle-east", "adventure"],
    countries: [
      { name: "Egypt", flag: "🇪🇬", image: u("photo-1572252009286-268acec5ca0a") },
      { name: "Qatar", flag: "🇶🇦", image: u("photo-1604999565976-8913ad2ddb7c") },
    ],
    highlights: [
      "Sharm El-Shayxda Qizil dengiz sho'ng'ini",
      "Cho'l safari va beduin lageri",
      "Doha Corniche va Souq Waqif",
      "Zamonaviy muzeylarga tashrif",
    ],
    included: ["2 ta xalqaro parvoz", "Mehmonxonalar", "All-inclusive", "Sho'ng'in", "Cho'l safari"],
    images: [u("photo-1572252009286-268acec5ca0a"), u("photo-1604999565976-8913ad2ddb7c")],
  },
];

export function getComboTourBySlug(slug: string): ComboTour | undefined {
  return COMBO_TOURS.find((tour) => tour.slug === slug);
}
