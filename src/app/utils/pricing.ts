export type BookingType = "domestic" | "international" | "custom" | "combo";

export interface StoredBooking {
  id: number;
  type: BookingType;
  title: string;
  price: number;
  priceCurrency?: string;
  name: string;
  phone: string;
  guests: number;
  bookedAt: string;
  days?: number;
  image?: string;
  /** Per-person base price for package bookings */
  basePrice?: number;
  budget?: string;
  hotelType?: string;
  transport?: string;
  destinationType?: string;
  /** DB row id for status sync */
  dbId?: number;
  /** Status synced from DB */
  status?: string;
  /** Planned travel date */
  travelDate?: string;
}

export function calculatePackagePrice(basePrice: number, guests: number): number {
  return Math.round(basePrice * Math.max(1, guests));
}

function parseBudgetMultiplier(budget: string): number {
  const lower = budget.toLowerCase();
  if (!budget) return 1;
  if (lower.includes("luxury") || lower.includes("1500")) return 2.5;
  if (lower.includes("mid") || lower.includes("500–1500") || lower.includes("500-1500")) return 1.6;
  if (budget.startsWith("$")) {
    const num = parseInt(budget.replace(/\D/g, ""), 10);
    if (num >= 1500) return 2.5;
    if (num >= 500) return 1.6;
  }
  return 1;
}

function hotelMultiplier(hotelType: string): number {
  const h = hotelType.toLowerCase();
  if (h.includes("5") || h.includes("luxury") || h.includes("premium")) return 1.35;
  if (h.includes("4") || h.includes("comfort")) return 1.15;
  if (h.includes("3") || h.includes("standard")) return 1;
  return 1.05;
}

function transportMultiplier(transport: string): number {
  const t = transport.toLowerCase();
  if (t.includes("flight") || t.includes("samolyot")) return 1.25;
  if (t.includes("private") || t.includes("shaxsiy")) return 1.12;
  return 1;
}

export function calculateCustomPrice(input: {
  days: number;
  travelers: number;
  budget?: string;
  hotelType?: string;
  transport?: string;
  destinationType?: string;
}): number {
  const perPersonDay = input.destinationType === "international" ? 180 : 120;
  let total =
    Math.max(1, input.days) *
    perPersonDay *
    Math.max(1, input.travelers);
  total *= parseBudgetMultiplier(input.budget || "");
  total *= hotelMultiplier(input.hotelType || "");
  total *= transportMultiplier(input.transport || "");
  return Math.max(100, Math.round(total));
}

export function recalculateBookingPrice(booking: StoredBooking): number {
  if (booking.type === "custom") {
    return calculateCustomPrice({
      days: booking.days ?? 3,
      travelers: booking.guests,
      budget: booking.budget,
      hotelType: booking.hotelType,
      transport: booking.transport,
      destinationType: booking.destinationType,
    });
  }
  const base =
    booking.basePrice ??
    Math.round(booking.price / Math.max(1, booking.guests));
  return calculatePackagePrice(base, booking.guests);
}

export function resolveBasePrice(booking: StoredBooking): number {
  if (booking.basePrice) return booking.basePrice;
  if (booking.type === "custom") {
    return recalculateBookingPrice({ ...booking, guests: 1 });
  }
  return Math.round(booking.price / Math.max(1, booking.guests));
}
