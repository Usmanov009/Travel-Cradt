import { COMBO_TOURS, ComboTour } from "../data/comboTours";
import { internationalPackages } from "../data/packages";

export interface ComboRecommendation {
  tour: ComboTour;
  /** Qidirilgan/tanlangan davlat shu Combo Tour ichida topilgan yozuv */
  matchedCountry: string;
  /** Combo tourdagi boshqa (qo'shimcha) davlat(lar) */
  otherCountries: string[];
  /** Agar shu davlat uchun bitta-davlatlik oddiy paket topilsa, undan qancha qimmatroq ekani (USD) */
  extraCost: number | null;
  reason: string;
}

/** Berilgan davlat nomiga mos keladigan barcha Combo Tourlarni topadi (katalogdan, yangi combo yaratmaydi) */
export function findComboToursForCountry(country: string): ComboTour[] {
  if (!country) return [];
  const needle = country.toLowerCase().trim();
  return COMBO_TOURS.filter((tour) =>
    tour.countries.some(
      (c) =>
        c.name.toLowerCase() === needle ||
        needle.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(needle),
    ),
  );
}

/** Shu davlat uchun eng arzon oddiy (bitta davlatlik) paket narxini topadi — solishtirish uchun baza */
function findBaselineSinglePrice(country: string): number | null {
  const needle = country.toLowerCase();
  const matches = internationalPackages.filter((p) => p.country?.toLowerCase() === needle);
  if (matches.length === 0) return null;
  return Math.min(...matches.map((p) => p.price));
}

export interface RecommendComboOptions {
  /** Qidirilayotgan/tanlangan davlat nomi */
  country?: string;
  /** Foydalanuvchi byudjeti (USD) — berilmasa, cheklov qo'yilmaydi */
  budget?: number;
  /** Foydalanuvchi rejalashtirgan kunlar soni — berilmasa, cheklov qo'yilmaydi */
  days?: number;
  /** Foydalanuvchi qiziqishlari (masalan: "Beach", "Luxury", "Family") — bonus ball uchun */
  interests?: string[];
}

const INTEREST_TO_CATEGORY: Record<string, ComboTour["categories"][number][]> = {
  beach: ["asia", "america"],
  luxury: ["luxury"],
  family: ["family"],
  nature: ["adventure"],
  adventure: ["adventure"],
  historical: ["europe", "middle-east"],
  culture: ["europe", "middle-east"],
  nightlife: ["luxury", "america"],
  honeymoon: ["honeymoon"],
  shopping: ["middle-east", "luxury"],
};

/**
 * Foydalanuvchining qidiruvi, byudjeti, sayohat davomiyligi va qiziqishlariga qarab
 * tizimda OLDINDAN MAVJUD bo'lgan Combo Tourlar orasidan mosini tavsiya qiladi.
 * AI hech qachon yangi combo tour generatsiya qilmaydi — faqat shu ro'yxatdan tanlaydi.
 * Mos variant topilmasa — bo'sh massiv qaytadi (har doim ham tavsiya bermaydi).
 */
export function recommendComboTours(options: RecommendComboOptions): ComboRecommendation[] {
  const { country, budget, days, interests = [] } = options;
  if (!country) return [];

  const candidates = findComboToursForCountry(country);
  if (candidates.length === 0) return [];

  const baselinePrice = findBaselineSinglePrice(country);
  const lowerInterests = interests.map((i) => i.toLowerCase());

  const scored = candidates
    .map((tour) => {
      const fitsBudget = !budget || budget <= 0 || tour.price <= budget * 1.25;
      // Combo tour davomiyligi foydalanuvchi rejasidan ko'p farq qilmasligi kerak
      const fitsDuration = !days || days <= 0 || Math.abs(tour.days - days) <= 4;

      const interestMatch = lowerInterests.some((interest) => {
        const mapped = INTEREST_TO_CATEGORY[interest];
        return mapped?.some((cat) => tour.categories.includes(cat));
      });

      const extraCost =
        baselinePrice !== null && tour.price > baselinePrice ? tour.price - baselinePrice : null;

      const matchedStop = tour.countries.find(
        (c) =>
          c.name.toLowerCase() === country.toLowerCase() ||
          country.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(country.toLowerCase()),
      );
      const otherCountries = tour.countries
        .filter((c) => c !== matchedStop)
        .map((c) => c.name);

      let reason: string;
      if (extraCost !== null) {
        reason = `✨ Siz uchun mos Combo Tour topildi. Atigi $${extraCost} qo'shimcha to'lab, ${matchedStop?.name || country} bilan birga ${otherCountries.join(", ")}ga ham sayohat qilishingiz mumkin.`;
      } else {
        reason = "Bu Combo Tour sizning byudjetingiz va sayohat davomiyligingizga mos keladi.";
      }

      return {
        tour,
        matchedCountry: matchedStop?.name || country,
        otherCountries,
        extraCost,
        reason,
        fitsBudget,
        fitsDuration,
        interestMatch,
      };
    })
    .filter((c) => c.fitsBudget && c.fitsDuration)
    .sort((a, b) => {
      if (a.interestMatch !== b.interestMatch) return a.interestMatch ? -1 : 1;
      return a.tour.price - b.tour.price;
    });

  return scored.map(({ tour, matchedCountry, otherCountries, extraCost, reason }) => ({
    tour,
    matchedCountry,
    otherCountries,
    extraCost,
    reason,
  }));
}
