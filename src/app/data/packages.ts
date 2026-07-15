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
  priceCurrency?: string;
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

export const domesticPackages: TravelPackage[] = [];

export const internationalPackages: TravelPackage[] = [];

export const allPackages = [...domesticPackages, ...internationalPackages].map(withPackageMedia);

export function getPackageBySlug(type: PackageType, id: number) {
  return allPackages.find((item) => item.type === type && item.id === id);
}

export function getPackagesByType(type: PackageType) {
  return allPackages.filter((item) => item.type === type);
}
