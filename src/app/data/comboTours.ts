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

export const COMBO_TOURS: ComboTour[] = [];

export function getComboTourBySlug(slug: string): ComboTour | undefined {
  return COMBO_TOURS.find((tour) => tour.slug === slug);
}
