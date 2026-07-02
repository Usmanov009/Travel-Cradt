const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

export interface SampleHouseRental {
  id: number;
  title: string;
  image: string;
  location: string;
  description: string;
  pricePerNight: number;
}

export interface SampleCarRental {
  id: number;
  title: string;
  image: string;
  location: string;
  description: string;
  pricePerDay: number;
}

export interface SampleTravelOffer {
  id: number;
  type: "flight" | "hotel";
  title: string;
  image: string;
  location: string;
  description: string;
  phone: string;
}

/** Placeholder examples shown until real data is added via the admin panel. */
export const SAMPLE_HOUSE_RENTALS: SampleHouseRental[] = [
  {
    id: -1,
    title: "Samarqand markazidagi 2 xonali kvartira",
    image: img("house1"),
    location: "Samarqand",
    description: "Shahar markazida, barcha qulayliklari bilan ta'minlangan zamonaviy kvartira.",
    pricePerNight: 45,
  },
  {
    id: -2,
    title: "Chimyondagi tog' uyi",
    image: img("house2"),
    location: "Chimyon",
    description: "Tabiat qo'ynida, 6 kishilik, kaminli hovli uy.",
    pricePerNight: 80,
  },
  {
    id: -3,
    title: "Buxoro eski shahar hovlisi",
    image: img("house3"),
    location: "Buxoro",
    description: "An'anaviy uslubda ta'mirlangan, ichki hovlili mehmon uyi.",
    pricePerNight: 60,
  },
];

export const SAMPLE_CAR_RENTALS: SampleCarRental[] = [
  {
    id: -1,
    title: "Chevrolet Cobalt",
    image: img("car1"),
    location: "Toshkent",
    description: "Ekonom klass, shahar ichida va yaqin safarlar uchun qulay.",
    pricePerDay: 25,
  },
  {
    id: -2,
    title: "Chevrolet Malibu",
    image: img("car2"),
    location: "Samarqand",
    description: "Komfort klass, konditsioner va avtomat uzatmalar qutisi bilan.",
    pricePerDay: 40,
  },
  {
    id: -3,
    title: "Toyota Land Cruiser Prado",
    image: img("car3"),
    location: "Toshkent",
    description: "Uzoq va tog'li yo'nalishlar uchun katta, quvvatli jip.",
    pricePerDay: 90,
  },
];

export const SAMPLE_TRAVEL_OFFERS: SampleTravelOffer[] = [
  {
    id: -1,
    type: "flight",
    title: "Toshkent — Istanbul aviachiptasi",
    image: img("flight1"),
    location: "Toshkent → Istanbul",
    description: "Qatnov aviachiptalari, bagaj bilan.",
    phone: "+998901234567",
  },
  {
    id: -2,
    type: "hotel",
    title: "Registon yaqinidagi mehmonxona",
    image: img("hotel1"),
    location: "Samarqand",
    description: "3 yulduzli mehmonxona, nonushta narxga kiritilgan.",
    phone: "+998901234567",
  },
  {
    id: -3,
    type: "flight",
    title: "Toshkent — Dubay aviachiptasi",
    image: img("flight2"),
    location: "Toshkent → Dubay",
    description: "To'g'ridan-to'g'ri parvoz, qulay vaqtlar.",
    phone: "+998901234567",
  },
];
