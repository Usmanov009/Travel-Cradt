import type { PackageType, TravelPackage } from "./packages";

export type PackageMedia = {
  cover: string;
  gallery: string[];
};

const u = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;

/** Wikimedia Commons destination photos (960px thumbs, CC-licensed) */
const WM = {
  registan:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Registan_Samarkand_Uzbekistan.JPG/960px-Registan_Samarkand_Uzbekistan.JPG",
  shahIZinda:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Shohi-Zinda_majmuasi_%28Shah-i-Zinda%2C_%D0%A8%D0%B0%D1%85%D0%B8-%D0%97%D0%B8%D0%BD%D0%B4%D0%B0%29.jpg/960px-Shohi-Zinda_majmuasi_%28Shah-i-Zinda%2C_%D0%A8%D0%B0%D1%85%D0%B8-%D0%97%D0%B8%D0%BD%D0%B4%D0%B0%29.jpg",
  kalyanMinaret:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Kalyan_Minaret%2C_Bukhara_2.jpg/960px-Kalyan_Minaret%2C_Bukhara_2.jpg",
  kalyanMosque:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bukhara_Kalyan_Mosque_yard.JPG/960px-Bukhara_Kalyan_Mosque_yard.JPG",
  kaltaMinor:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Kalta_Minor%2C_Khiva%2C_Uzbekistan.jpg/960px-Kalta_Minor%2C_Khiva%2C_Uzbekistan.jpg",
  khivaItchanKala:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Itchan_Kala_west_gate.jpg/960px-Itchan_Kala_west_gate.jpg",
  khivaKonyaArk:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Konya_Ark_towers_%28%D0%A6%D0%B8%D1%82%D0%B0%D0%B4%D0%B5%D0%BB%D1%8C_%D0%9A%D1%83%D0%BD%D1%8F-%D0%90%D1%80%D0%BA%2C_Ko%CA%BBhna_ark%29%2C_Itchan_Kala%2C_Khiva.jpg/960px-Konya_Ark_towers_%28%D0%A6%D0%B8%D1%82%D0%B0%D0%B4%D0%B5%D0%BB%D1%8C_%D0%9A%D1%83%D0%BD%D1%8F-%D0%90%D1%80%D0%BA%2C_Ko%CA%BBhna_ark%29%2C_Itchan_Kala%2C_Khiva.jpg",
  chimganMountains:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Chimgan_Mountains.jpg/960px-Chimgan_Mountains.jpg",
  greaterChimgan:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Greater_Chimgan_Mountain.JPG/960px-Greater_Chimgan_Mountain.JPG",
  charvak:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Charvak_Reservoir_and_Mountains.jpg/960px-Charvak_Reservoir_and_Mountains.jpg",
  amirsoyChalets:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Chalets_at_Amirsoy_Resort.jpg/960px-Chalets_at_Amirsoy_Resort.jpg",
  imamBukhariMausoleum:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/AlBukhari_Mausoleum.jpg/960px-AlBukhari_Mausoleum.jpg",
  imamBukhariTomb:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Tomb_of_Imam_Al_Bukhari.jpg/960px-Tomb_of_Imam_Al_Bukhari.jpg",
  naqshbandiMausoleum:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Naqschbandi-Mausoleum.JPG/960px-Naqschbandi-Mausoleum.JPG",
  tashkentMetro:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Metrostation_Alisher_Navoiy_in_Taschkent_1.jpg/960px-Metrostation_Alisher_Navoiy_in_Taschkent_1.jpg",
  milliyBog:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Milliy_bog.jpg/960px-Milliy_bog.jpg",
  zaamin:
    "https://upload.wikimedia.org/wikipedia/commons/0/00/Zaamin_National_Park.jpg",
  sentobValley:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Sentob_valley.jpg/960px-Sentob_valley.jpg",
  nuratauAydar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Nuratau_mountains_and_Aydar_lake.jpg/960px-Nuratau_mountains_and_Aydar_lake.jpg",
  kyzylkumDesert:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Kyzylkum_Desert_in_Uzbekistan.jpg/960px-Kyzylkum_Desert_in_Uzbekistan.jpg",
  kyzylkumYurts:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Kazakh_yurts_at_night_in_the_Kyzylkum_desert%2C_Uzbekistan.jpg/960px-Kazakh_yurts_at_night_in_the_Kyzylkum_desert%2C_Uzbekistan.jpg",
} as const;

/** Destination-specific cover + gallery images keyed by `{type}-{id}` */
export const PACKAGE_MEDIA: Record<string, PackageMedia> = {
  // ── Domestic (Wikimedia Commons — manzilga mos rasmlar) ──
  "domestic-1": {
    cover: WM.registan,
    gallery: [WM.registan, WM.shahIZinda, WM.imamBukhariMausoleum],
  },
  "domestic-2": {
    cover: WM.kalyanMinaret,
    gallery: [WM.kalyanMinaret, WM.kalyanMosque, WM.naqshbandiMausoleum],
  },
  "domestic-3": {
    cover: WM.kaltaMinor,
    gallery: [WM.kaltaMinor, WM.khivaItchanKala, WM.khivaKonyaArk],
  },
  "domestic-4": {
    cover: WM.chimganMountains,
    gallery: [WM.chimganMountains, WM.greaterChimgan, WM.charvak],
  },
  "domestic-5": {
    cover: WM.charvak,
    gallery: [WM.charvak, WM.chimganMountains, WM.greaterChimgan],
  },
  "domestic-6": {
    cover: WM.amirsoyChalets,
    gallery: [WM.amirsoyChalets, WM.greaterChimgan, WM.chimganMountains],
  },
  "domestic-7": {
    cover: WM.imamBukhariMausoleum,
    gallery: [WM.imamBukhariMausoleum, WM.imamBukhariTomb, WM.registan],
  },
  "domestic-8": {
    cover: WM.naqshbandiMausoleum,
    gallery: [WM.naqshbandiMausoleum, WM.kalyanMosque, WM.kalyanMinaret],
  },
  "domestic-9": {
    cover: WM.tashkentMetro,
    gallery: [WM.tashkentMetro, WM.milliyBog, WM.amirsoyChalets],
  },
  "domestic-10": {
    cover: WM.zaamin,
    gallery: [WM.zaamin, WM.sentobValley, WM.nuratauAydar],
  },
  "domestic-11": {
    cover: WM.nuratauAydar,
    gallery: [WM.nuratauAydar, WM.sentobValley, WM.zaamin],
  },
  "domestic-12": {
    cover: WM.kyzylkumDesert,
    gallery: [WM.kyzylkumDesert, WM.kyzylkumYurts, WM.nuratauAydar],
  },
  "domestic-13": {
    cover: WM.registan,
    gallery: [WM.registan, WM.charvak, WM.kyzylkumYurts],
  },

  // ── International ──
  "international-1": {
    cover: u("photo-1524231757912-21f4fe3a7200"),
    gallery: [
      u("photo-1524231757912-21f4fe3a7200"),
      u("photo-1507525428034-b723cf961d3e"),
      u("photo-1559628233-100c798742d4"),
    ],
  },
  "international-2": {
    cover: u("photo-1512453979798-5ea266f8880c"),
    gallery: [
      u("photo-1512453979798-5ea266f8880c"),
      u("photo-1518684079-3c830dcef090"),
      u("photo-1582672060674-bc2bd808a8b5"),
    ],
  },
  "international-3": {
    cover: u("photo-1552465011-b4e21bf6e79a"),
    gallery: [
      u("photo-1552465011-b4e21bf6e79a"),
      u("photo-1507525428034-b723cf961d3e"),
      u("photo-1506744038136-46273834b3fb"),
    ],
  },
  "international-4": {
    cover: u("photo-1591604129939-f1efa4d9f7fa"),
    gallery: [
      u("photo-1591604129939-f1efa4d9f7fa"),
      u("photo-1564769625905-50e93615e769"),
      u("photo-1546412414-adabb9f83c78"),
    ],
  },
  "international-5": {
    cover: u("photo-1537996194471-e657df975ab4"),
    gallery: [
      u("photo-1537996194471-e657df975ab4"),
      u("photo-1518548419970-58e3b4079b2f"),
      u("photo-1500530855697-b586d89ba3ee"),
    ],
  },
  "international-6": {
    cover: u("photo-1541432901042-2d8bd64b4a9b"),
    gallery: [
      u("photo-1541432901042-2d8bd64b4a9b"),
      u("photo-1524231757912-21f4fe3a7200"),
      u("photo-1559628233-100c798742d4"),
    ],
  },
  "international-7": {
    cover: u("photo-1514282401047-d79a71a590e8"),
    gallery: [
      u("photo-1514282401047-d79a71a590e8"),
      u("photo-1507525428034-b723cf961d3e"),
      u("photo-1573843981267-be1999ff37cd"),
    ],
  },
  "international-8": {
    cover: u("photo-1582672060674-bc2bd808a8b5"),
    gallery: [
      u("photo-1582672060674-bc2bd808a8b5"),
      u("photo-1512453979798-5ea266f8880c"),
      u("photo-1518684079-3c830dcef090"),
    ],
  },
  "international-9": {
    cover: u("photo-1613395877344-13d4a8e0d49e"),
    gallery: [
      u("photo-1613395877344-13d4a8e0d49e"),
      u("photo-1500534314209-a25ddb2bd429"),
      u("photo-1493558103817-58b2924bce98"),
    ],
  },
  "international-10": {
    cover: u("photo-1572252009286-268acec5ca0a"),
    gallery: [
      u("photo-1572252009286-268acec5ca0a"),
      u("photo-1544551763-46a013bb70d5"),
      u("photo-1507525428034-b723cf961d3e"),
    ],
  },
  "international-11": {
    cover: u("photo-1596422846543-75c6fc197f07"),
    gallery: [
      u("photo-1596422846543-75c6fc197f07"),
      u("photo-1518548419970-58e3b4079b2f"),
      u("photo-1537996194471-e657df975ab4"),
    ],
  },
  "international-12": {
    cover: u("photo-1604999565976-8913ad2ddb7c"),
    gallery: [
      u("photo-1604999565976-8913ad2ddb7c"),
      u("photo-1512453979798-5ea266f8880c"),
      u("photo-1582672060674-bc2bd808a8b5"),
    ],
  },
};

export const CATEGORY_IMAGES: Record<string, string> = {
  historical: PACKAGE_MEDIA["domestic-1"].cover,
  nature: PACKAGE_MEDIA["domestic-4"].cover,
  pilgrimage: PACKAGE_MEDIA["domestic-7"].cover,
  family: PACKAGE_MEDIA["domestic-9"].cover,
  adventure: PACKAGE_MEDIA["domestic-11"].cover,
  beach: PACKAGE_MEDIA["international-3"].cover,
  weekend: PACKAGE_MEDIA["domestic-10"].cover,
  luxury: PACKAGE_MEDIA["international-2"].cover,
  honeymoon: PACKAGE_MEDIA["international-9"].cover,
  religious: PACKAGE_MEDIA["international-4"].cover,
  shopping: PACKAGE_MEDIA["international-8"].cover,
  custom: PACKAGE_MEDIA["domestic-13"].cover,
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
  type: PackageType | "custom" | "combo",
  id: number,
): string | undefined {
  if (type === "custom" || type === "combo") return PACKAGE_MEDIA["domestic-13"]?.cover;
  const media = PACKAGE_MEDIA[packageMediaKey(type, id)];
  return media?.cover;
}
