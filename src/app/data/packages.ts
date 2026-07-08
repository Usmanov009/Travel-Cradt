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
    title: "Samarkand + Bukhara Heritage Tour",
    description: "Discover two of Uzbekistan's most iconic Silk Road cities in one unforgettable trip",
    image: "/images/dilrabo/samarqand-buxoro.jpg",
    duration: "4 days / 3 nights",
    price: 108,
    rating: 4.9,
    included: ["Hotel", "Transportation", "Guide"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Walk through centuries of Silk Road history, from Samarkand's turquoise domes to Bukhara's ancient madrasahs.",
    translations: {
      uz: {
        title: "Samarqand + Buxoro",
        description: "O'zbekistonning eng mashhur ikkita Ipak Yo'li shahrini bir sayohatda kashf eting",
        vibe: "1.290.000 so'mdan boshlab, 4 kun / 3 kecha.",
        duration: "4 kun / 3 kecha",
      },
      ru: {
        title: "Самарканд + Бухара",
        description: "Откройте для себя два самых знаковых города Шёлкового пути Узбекистана за одну поездку",
        vibe: "От 1 290 000 сум, 4 дня / 3 ночи.",
        duration: "4 дня / 3 ночи",
      },
    },
  },
  {
    id: 2,
    type: "domestic",
    category: "historical",
    title: "Samarkand + Tashkent Discovery",
    description: "A perfect short getaway combining the capital's modern charm with Samarkand's timeless beauty",
    image: "/images/dilrabo/samarqand-toshkent.jpg",
    duration: "3 days / 2 nights",
    price: 73,
    rating: 4.8,
    included: ["Hotel", "Transportation", "Guide"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "From Tashkent's grand mosques to Samarkand's Gur-e-Amir mausoleum, a compact taste of Uzbekistan's heart.",
    translations: {
      uz: {
        title: "Samarqand + Toshkent",
        description: "Poytaxtning zamonaviy joziba va Samarqandning abadiy go'zalligini birlashtirgan mukammal qisqa sayohat",
        vibe: "870.000 so'mdan boshlab, 3 kun / 2 kecha.",
        duration: "3 kun / 2 kecha",
      },
      ru: {
        title: "Самарканд + Ташкент",
        description: "Идеальная короткая поездка, объединяющая современный шарм столицы и вечную красоту Самарканда",
        vibe: "От 870 000 сум, 3 дня / 2 ночи.",
        duration: "3 дня / 2 ночи",
      },
    },
  },
];

export const internationalPackages: TravelPackage[] = [
  {
    id: 1,
    type: "international",
    category: "business",
    title: "Canton Fair 2026 Business Expo",
    description: "Join China's largest international trade fair with flights, 5-star hotel, and full business support included",
    image: "/images/dilrabo/canton-fair-2026.jpg",
    duration: "9 days",
    price: 1765,
    rating: 4.9,
    country: "China",
    hotel: "5-Star Hotel",
    flightIncluded: true,
    included: [
      "Flight tickets",
      "7 nights in a 5-star hotel",
      "3 meals a day",
      "Airport transfer",
      "Canton Fair shuttle transfer",
      "Excursion transfers",
      "Translation device",
      "Powerbank",
      "Professional tour guide",
    ],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Explore the largest international trade exhibition in China, plus a bonus Guangzhou glass bridge adventure and Chongqing city excursion.",
    translations: {
      uz: {
        title: "Canton Fair 2026",
        description: "Xitoydagi eng yirik xalqaro biznes ko'rgazmasiga biz bilan yo'l oling!",
        vibe: "Safar sanasi: 13.10–21.10, Canton Fair 1-faza: 15.10–19.10. Tur narxi: 1765$, hoziroq 765$ bilan bron qiling (joylar soni 40 ta bilan cheklangan). Bonus: Guangzhou shisha ko'prigi sayohati va Chongqing ekskursiyasi. Qolgan to'lovni uchishdan 20 kun oldin qilsa bo'ladi.",
        duration: "9 kun (7 kecha)",
      },
      ru: {
        title: "Кантонская ярмарка 2026",
        description: "Отправляйтесь с нами на крупнейшую международную бизнес-выставку в Китае!",
        vibe: "Даты поездки: 13.10–21.10, 1-я фаза Canton Fair: 15.10–19.10. Стоимость тура: 1765$. Бонус: мост из стекла в Гуанчжоу и экскурсия в Чунцин.",
        duration: "9 дней (7 ночей)",
      },
    },
  },
  {
    id: 2,
    type: "international",
    category: "neighboring",
    title: "Khujand Getaway (Tajikistan)",
    description: "A refreshing short trip to Tajikistan's second-largest city on the Syr Darya river",
    image: "/images/dilrabo/xojand-tojikiston.jpg",
    duration: "2 days / 1 night",
    price: 110,
    rating: 4.6,
    country: "Tajikistan",
    hotel: "City Hotel",
    flightIncluded: false,
    included: ["Transportation", "Hotel", "Guide"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Stroll along the riverside promenade beneath Tajikistan's giant flagpole and explore the city's parks and bazaars.",
    translations: {
      uz: {
        title: "Xo'jand (Tojikiston)",
        description: "Tojikistonning Sirdaryo bo'yidagi ikkinchi yirik shahriga qisqa va yoqimli sayohat",
        vibe: "$110 dan boshlab, 2 kun / 1 kecha.",
        duration: "2 kun / 1 kecha",
      },
      ru: {
        title: "Худжанд (Таджикистан)",
        description: "Короткая и приятная поездка во второй по величине город Таджикистана на реке Сырдарья",
        vibe: "От $110, 2 дня / 1 ночь.",
        duration: "2 дня / 1 ночь",
      },
    },
  },
  {
    id: 3,
    type: "international",
    category: "neighboring",
    title: "Turkistan Heritage Trip (Kazakhstan)",
    description: "Visit the sacred Mausoleum of Khoja Ahmed Yasawi and the historical city of Turkistan",
    image: "/images/dilrabo/turkiston-qozogiston.jpg",
    duration: "2 days / 1 night",
    price: 110,
    rating: 4.7,
    country: "Kazakhstan",
    hotel: "City Hotel",
    flightIncluded: false,
    included: ["Transportation", "Hotel", "Guide", "Entrance Tickets"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Wander the yurt park and gardens surrounding one of Central Asia's most revered spiritual landmarks.",
    translations: {
      uz: {
        title: "Turkiston (Qozog'iston)",
        description: "Xoja Ahmad Yassaviy maqbarasi va tarixiy Turkiston shahriga sayohat",
        vibe: "$110 dan boshlab, 2 kun / 1 kecha.",
        duration: "2 kun / 1 kecha",
      },
      ru: {
        title: "Туркестан (Казахстан)",
        description: "Поездка к мавзолею Ходжи Ахмеда Ясави и в исторический город Туркестан",
        vibe: "От $110, 2 дня / 1 ночь.",
        duration: "2 дня / 1 ночь",
      },
    },
  },
  {
    id: 4,
    type: "international",
    category: "beach",
    title: "Issyk-Kul Lakeside Retreat (Kyrgyzstan)",
    description: "Relax on the sandy beaches of Central Asia's great mountain lake, framed by snow-capped peaks",
    image: "/images/dilrabo/issiqkol-qirgiziston.jpg",
    duration: "3 days / 2 nights",
    price: 220,
    rating: 4.9,
    country: "Kyrgyzstan",
    hotel: "Lakeside Resort",
    flightIncluded: false,
    included: ["Resort Stay", "Transportation", "Beach Access"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Swim in the turquoise waters of Issyk-Kul with the Tian Shan mountains rising dramatically behind the shore.",
    translations: {
      uz: {
        title: "Issiq-Ko'l (Qirg'iziston)",
        description: "Markaziy Osiyoning buyuk tog' ko'li qumli plyajlarida, qorli cho'qqilar qurshovida dam oling",
        vibe: "$220 dan boshlab, 3 kun / 2 kecha.",
        duration: "3 kun / 2 kecha",
      },
      ru: {
        title: "Иссык-Куль (Кыргызстан)",
        description: "Отдохните на песчаных пляжах великого горного озера Центральной Азии в окружении заснеженных вершин",
        vibe: "От $220, 3 дня / 2 ночи.",
        duration: "3 дня / 2 ночи",
      },
    },
  },
  {
    id: 5,
    type: "international",
    category: "nature",
    title: "Sari-Chelek Nature Escape (Kyrgyzstan)",
    description: "Trek through the pristine Sari-Chelek Biosphere Reserve with its turquoise lakes and forested peaks",
    image: "/images/dilrabo/sarichelek-qirgiziston.jpg",
    duration: "3 days / 2 nights",
    price: 95,
    rating: 4.8,
    country: "Kyrgyzstan",
    hotel: "Guesthouse",
    flightIncluded: false,
    included: ["Transportation", "Accommodation", "Guide"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Hike above a chain of glacial lakes ringed by snow-dusted mountains — a hidden gem for nature lovers.",
    translations: {
      uz: {
        title: "Sari-Chelek (Qirg'iziston)",
        description: "Sari-Chelek biosfera qo'riqxonasining ko'k ko'llari va o'rmonli cho'qqilari bo'ylab treking",
        vibe: "$95 dan boshlab, 3 kun / 2 kecha.",
        duration: "3 kun / 2 kecha",
      },
      ru: {
        title: "Сары-Челек (Кыргызстан)",
        description: "Треккинг по нетронутому биосферному заповеднику Сары-Челек с бирюзовыми озёрами и лесистыми вершинами",
        vibe: "От $95, 3 дня / 2 ночи.",
        duration: "3 дня / 2 ночи",
      },
    },
  },
  {
    id: 6,
    type: "international",
    category: "nature",
    title: "Qora-Qoy Mountain Yurt Camp (Kyrgyzstan)",
    description: "A one-day escape to a scenic yurt camp tucked between pine forests and snow-capped peaks",
    image: "/images/dilrabo/qoraqoy-qirgiziston.jpg",
    duration: "1 day",
    price: 20,
    rating: 4.7,
    country: "Kyrgyzstan",
    hotel: "Yurt Camp",
    flightIncluded: false,
    included: ["Transportation", "Guide"],
    companyId: 1,
    companyName: "Dilbar Travel",
    companyLogo: "/images/dilrabo/dilrabo-logo.png",
    vibe: "Spend the day among traditional yurts on a green alpine meadow surrounded by dramatic mountain scenery.",
    translations: {
      uz: {
        title: "Qora-Qo'y (Qirg'iziston)",
        description: "Qarag'ay o'rmonlari va qorli cho'qqilar orasidagi manzarali yurta lageriga bir kunlik sayohat",
        vibe: "245.000 so'mdan boshlab, 1 kun.",
        duration: "1 kun",
      },
      ru: {
        title: "Кара-Кой (Кыргызстан)",
        description: "Однодневная поездка в живописный юрточный лагерь среди сосновых лесов и заснеженных вершин",
        vibe: "От 245 000 сум, 1 день.",
        duration: "1 день",
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
