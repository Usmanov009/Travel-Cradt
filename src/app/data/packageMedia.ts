import type { PackageType, TravelPackage } from "./packages";

export type PackageMedia = {
  cover: string;
  gallery: string[];
};

/** Dilrabo Travel — real promotional package photos */
const IMG = {
  cantonFair: "/images/dilrabo/canton-fair-2026.jpg",
  khujand: "/images/dilrabo/xojand-tojikiston.jpg",
  turkistan: "/images/dilrabo/turkiston-qozogiston.jpg",
  issykKul: "/images/dilrabo/issiqkol-qirgiziston.jpg",
  samarqandBuxoro: "/images/dilrabo/samarqand-buxoro.jpg",
  samarqandToshkent: "/images/dilrabo/samarqand-toshkent.jpg",
  sariChelek: "/images/dilrabo/sarichelek-qirgiziston.jpg",
  qoraQoy: "/images/dilrabo/qoraqoy-qirgiziston.jpg",
  azerbaijan: "/images/dilrabo/azerbaijan-baku.jpg",
  malaysia: "/images/dilrabo/malaysia-kualalumpur.jpg",
  georgia: "/images/dilrabo/georgia-tbilisi.jpg",
} as const;

/** Destination-specific cover + gallery images keyed by `{type}-{id}` */
export const PACKAGE_MEDIA: Record<string, PackageMedia> = {
  // ── Domestic (Uzbekistan) ──
  "domestic-1": {
    cover: IMG.samarqandBuxoro,
    gallery: [IMG.samarqandBuxoro],
  },
  "domestic-2": {
    cover: IMG.samarqandToshkent,
    gallery: [IMG.samarqandToshkent],
  },

  // ── International ──
  "international-1": {
    cover: IMG.cantonFair,
    gallery: [IMG.cantonFair],
  },
  "international-2": {
    cover: IMG.khujand,
    gallery: [IMG.khujand],
  },
  "international-3": {
    cover: IMG.turkistan,
    gallery: [IMG.turkistan],
  },
  "international-4": {
    cover: IMG.issykKul,
    gallery: [IMG.issykKul],
  },
  "international-5": {
    cover: IMG.sariChelek,
    gallery: [IMG.sariChelek],
  },
  "international-6": {
    cover: IMG.qoraQoy,
    gallery: [IMG.qoraQoy],
  },
  "international-7": {
    cover: IMG.azerbaijan,
    gallery: [IMG.azerbaijan],
  },
  "international-8": {
    cover: IMG.malaysia,
    gallery: [IMG.malaysia],
  },
  "international-9": {
    cover: IMG.georgia,
    gallery: [IMG.georgia],
  },
};

export const CATEGORY_IMAGES: Record<string, string> = {
  historical: PACKAGE_MEDIA["domestic-1"].cover,
  business: PACKAGE_MEDIA["international-1"].cover,
  neighboring: PACKAGE_MEDIA["international-2"].cover,
  beach: PACKAGE_MEDIA["international-4"].cover,
  nature: PACKAGE_MEDIA["international-5"].cover,
};

export function packageMediaKey(type: PackageType, id: number) {
  return `${type}-${id}`;
}

export function resolvePackageMedia(
  type: PackageType,
  id: number,
  fallbackImage: string,
): PackageMedia {
  return (
    PACKAGE_MEDIA[packageMediaKey(type, id)] ?? {
      cover: fallbackImage,
      gallery: [fallbackImage],
    }
  );
}

/** Attach cover + gallery images to a package record */
export function withPackageMedia(pkg: TravelPackage): TravelPackage {
  const media = resolvePackageMedia(pkg.type, pkg.id, pkg.image);
  return {
    ...pkg,
    image: media.cover,
    images: media.gallery,
  };
}

export function getPackageImages(pkg: TravelPackage): string[] {
  if (pkg.images?.length) return pkg.images;
  return resolvePackageMedia(pkg.type, pkg.id, pkg.image).gallery;
}

export function getCategoryImage(category: string): string | undefined {
  return CATEGORY_IMAGES[category];
}

export function getPackageImageByRef(
  type: PackageType | "combo",
  id: number,
): string | undefined {
  if (type === "combo") return PACKAGE_MEDIA["domestic-1"]?.cover;
  const media = PACKAGE_MEDIA[packageMediaKey(type, id)];
  return media?.cover;
}
