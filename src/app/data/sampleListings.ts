/** Unsplash source photos (free to use), sized to match the card layout. */
const u = (id: string) => `https://images.unsplash.com/${id}?w=800&h=600&fit=crop&q=80&auto=format`;

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
    image: u("photo-1512917774080-9991f1c4c750"),
    location: "Samarqand",
    description: "Shahar markazida, barcha qulayliklari bilan ta'minlangan zamonaviy kvartira.",
    pricePerNight: 45,
  },
  {
    id: -2,
    title: "Chimyondagi tog' uyi",
    image: u("photo-1568605114967-8130f3a36994"),
    location: "Chimyon",
    description: "Tabiat qo'ynida, 6 kishilik, kaminli hovli uy.",
    pricePerNight: 80,
  },
  {
    id: -3,
    title: "Buxoro eski shahar hovlisi",
    image: u("photo-1570129477492-45c003edd2be"),
    location: "Buxoro",
    description: "An'anaviy uslubda ta'mirlangan, ichki hovlili mehmon uyi.",
    pricePerNight: 60,
  },
];

export const SAMPLE_CAR_RENTALS: SampleCarRental[] = [
  {
    id: -1,
    title: "Chevrolet Cobalt",
    image: u("photo-1541899481282-d53bffe3c35d"),
    location: "Toshkent",
    description: "Ekonom klass, shahar ichida va yaqin safarlar uchun qulay.",
    pricePerDay: 25,
  },
  {
    id: -2,
    title: "Chevrolet Malibu",
    image: u("photo-1503376780353-7e6692767b70"),
    location: "Samarqand",
    description: "Komfort klass, konditsioner va avtomat uzatmalar qutisi bilan.",
    pricePerDay: 40,
  },
  {
    id: -3,
    title: "Toyota Land Cruiser Prado",
    image: u("photo-1533473359331-0135ef1b58bf"),
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
    image: u("photo-1569154941061-e231b4725ef1"),
    location: "Toshkent → Istanbul",
    description: "Qatnov aviachiptalari, bagaj bilan.",
    phone: "+998901234567",
  },
  {
    id: -2,
    type: "hotel",
    title: "Registon yaqinidagi mehmonxona",
    image: u("photo-1566073771259-6a8506099945"),
    location: "Samarqand",
    description: "3 yulduzli mehmonxona, nonushta narxga kiritilgan.",
    phone: "+998901234567",
  },
  {
    id: -3,
    type: "flight",
    title: "Toshkent — Dubay aviachiptasi",
    image: u("photo-1556388158-158ea5ccacbd"),
    location: "Toshkent → Dubay",
    description: "To'g'ridan-to'g'ri parvoz, qulay vaqtlar.",
    phone: "+998901234567",
  },
];
