require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const defaultTourCompanies = [
  {
    key: 'dilrabo', name: 'Dilrabo Travel', email: 'info@dilrabotravel.uz',
    phone: '+998 71 200 10 01', address: 'Tashkent, O\'zbekiston',
    website: 'https://dilrabotravel.uz',
    description: 'Ishonchli sayohatlaringiz uchun — mahalliy va xalqaro tur paketlari bo\'yicha yetakchi tur firma.',
    logo: '/images/dilrabo/dilrabo-logo.png',
  },
  {
    key: 'dilbar', name: 'Dilbar Travel', email: 'info@dilbartravel.uz',
    phone: '+998 90 123 45 67', address: 'Tashkent, O\'zbekiston',
    website: 'https://dilbartravel.uz',
    description: 'Sifatli va qulay sayohatlar uchun — ichki va xalqaro turlar bo\'yicha professional tur operatori.',
    logo: '/images/dilrabo/dilrabo-logo.png',
  },
];

const domesticPackages = [
  {
    local_id: 1, type: 'domestic', category: 'historical',
    title: 'Samarkand + Bukhara Heritage Tour',
    description: 'Discover two of Uzbekistan\'s most iconic Silk Road cities in one unforgettable trip',
    image: '/images/dilrabo/samarqand-buxoro.jpg',
    duration: '4 days / 3 nights', price: 108, rating: 4.9,
    included: ['Hotel', 'Transportation', 'Guide'],
    vibe: 'Walk through centuries of Silk Road history, from Samarkand\'s turquoise domes to Bukhara\'s ancient madrasahs.',
    translations: {
      uz: { title: 'Samarqand + Buxoro', description: 'O\'zbekistonning eng mashhur ikkita Ipak Yo\'li shahrini bir sayohatda kashf eting', vibe: '1.290.000 so\'mdan boshlab, 4 kun / 3 kecha.', duration: '4 kun / 3 kecha' },
      ru: { title: 'Самарканд + Бухара', description: 'Откройте для себя два самых знаковых города Шёлкового пути Узбекистана за одну поездку', vibe: 'От 1 290 000 сум, 4 дня / 3 ночи.', duration: '4 дня / 3 ночи' }
    }
  },
  {
    local_id: 2, type: 'domestic', category: 'historical',
    title: 'Samarkand + Tashkent Discovery',
    description: 'A perfect short getaway combining the capital\'s modern charm with Samarkand\'s timeless beauty',
    image: '/images/dilrabo/samarqand-toshkent.jpg',
    duration: '3 days / 2 nights', price: 73, rating: 4.8,
    included: ['Hotel', 'Transportation', 'Guide'],
    vibe: 'From Tashkent\'s grand mosques to Samarkand\'s Gur-e-Amir mausoleum, a compact taste of Uzbekistan\'s heart.',
    translations: {
      uz: { title: 'Samarqand + Toshkent', description: 'Poytaxtning zamonaviy joziba va Samarqandning abadiy go\'zalligini birlashtirgan mukammal qisqa sayohat', vibe: '870.000 so\'mdan boshlab, 3 kun / 2 kecha.', duration: '3 kun / 2 kecha' },
      ru: { title: 'Самарканд + Ташкент', description: 'Идеальная короткая поездка, объединяющая современный шарм столицы и вечную красоту Самарканда', vibe: 'От 870 000 сум, 3 дня / 2 ночи.', duration: '3 дня / 2 ночи' }
    }
  },
];

const internationalPackages = [
  {
    local_id: 1, type: 'international', category: 'business',
    title: 'Canton Fair 2026 Business Expo',
    description: 'Join China\'s largest international trade fair with flights, 5-star hotel, and full business support included',
    image: '/images/dilrabo/canton-fair-2026.jpg',
    duration: '9 days', price: 1765, rating: 4.9,
    country: 'China', hotel: '5-Star Hotel', flight_included: true,
    included: ['Flight tickets', '7 nights in a 5-star hotel', '3 meals a day', 'Airport transfer', 'Canton Fair shuttle transfer', 'Excursion transfers', 'Translation device', 'Powerbank', 'Professional tour guide'],
    vibe: 'Explore the largest international trade exhibition in China, plus a bonus Guangzhou glass bridge adventure and Chongqing city excursion.',
    translations: {
      uz: { title: 'Canton Fair 2026', description: 'Xitoydagi eng yirik xalqaro biznes ko\'rgazmasiga biz bilan yo\'l oling!', vibe: 'Safar sanasi: 13.10–21.10, Canton Fair 1-faza: 15.10–19.10. Tur narxi: 1765$, hoziroq 765$ bilan bron qiling (joylar soni 40 ta bilan cheklangan). Bonus: Guangzhou shisha ko\'prigi sayohati va Chongqing ekskursiyasi. Qolgan to\'lovni uchishdan 20 kun oldin qilsa bo\'ladi.', duration: '9 kun (7 kecha)' },
      ru: { title: 'Кантонская ярмарка 2026', description: 'Отправляйтесь с нами на крупнейшую международную бизнес-выставку в Китае!', vibe: 'Даты поездки: 13.10–21.10, 1-я фаза Canton Fair: 15.10–19.10. Стоимость тура: 1765$. Бонус: мост из стекла в Гуанчжоу и экскурсия в Чунцин.', duration: '9 дней (7 ночей)' }
    }
  },
  {
    local_id: 2, type: 'international', category: 'neighboring',
    title: 'Khujand Getaway (Tajikistan)',
    description: 'A refreshing short trip to Tajikistan\'s second-largest city on the Syr Darya river',
    image: '/images/dilrabo/xojand-tojikiston.jpg',
    duration: '2 days / 1 night', price: 110, rating: 4.6,
    country: 'Tajikistan', hotel: 'City Hotel', flight_included: false,
    included: ['Transportation', 'Hotel', 'Guide'],
    vibe: 'Stroll along the riverside promenade beneath Tajikistan\'s giant flagpole and explore the city\'s parks and bazaars.',
    translations: {
      uz: { title: 'Xo\'jand (Tojikiston)', description: 'Tojikistonning Sirdaryo bo\'yidagi ikkinchi yirik shahriga qisqa va yoqimli sayohat', vibe: '$110 dan boshlab, 2 kun / 1 kecha.', duration: '2 kun / 1 kecha' },
      ru: { title: 'Худжанд (Таджикистан)', description: 'Короткая и приятная поездка во второй по величине город Таджикистана на реке Сырдарья', vibe: 'От $110, 2 дня / 1 ночь.', duration: '2 дня / 1 ночь' }
    }
  },
  {
    local_id: 3, type: 'international', category: 'neighboring',
    title: 'Turkistan Heritage Trip (Kazakhstan)',
    description: 'Visit the sacred Mausoleum of Khoja Ahmed Yasawi and the historical city of Turkistan',
    image: '/images/dilrabo/turkiston-qozogiston.jpg',
    duration: '2 days / 1 night', price: 110, rating: 4.7,
    country: 'Kazakhstan', hotel: 'City Hotel', flight_included: false,
    included: ['Transportation', 'Hotel', 'Guide', 'Entrance Tickets'],
    vibe: 'Wander the yurt park and gardens surrounding one of Central Asia\'s most revered spiritual landmarks.',
    translations: {
      uz: { title: 'Turkiston (Qozog\'iston)', description: 'Xoja Ahmad Yassaviy maqbarasi va tarixiy Turkiston shahriga sayohat', vibe: '$110 dan boshlab, 2 kun / 1 kecha.', duration: '2 kun / 1 kecha' },
      ru: { title: 'Туркестан (Казахстан)', description: 'Поездка к мавзолею Ходжи Ахмеда Ясави и в исторический город Туркестан', vibe: 'От $110, 2 дня / 1 ночь.', duration: '2 дня / 1 ночь' }
    }
  },
  {
    local_id: 4, type: 'international', category: 'beach',
    title: 'Issyk-Kul Lakeside Retreat (Kyrgyzstan)',
    description: 'Relax on the sandy beaches of Central Asia\'s great mountain lake, framed by snow-capped peaks',
    image: '/images/dilrabo/issiqkol-qirgiziston.jpg',
    duration: '3 days / 2 nights', price: 220, rating: 4.9,
    country: 'Kyrgyzstan', hotel: 'Lakeside Resort', flight_included: false,
    included: ['Resort Stay', 'Transportation', 'Beach Access'],
    vibe: 'Swim in the turquoise waters of Issyk-Kul with the Tian Shan mountains rising dramatically behind the shore.',
    translations: {
      uz: { title: 'Issiq-Ko\'l (Qirg\'iziston)', description: 'Markaziy Osiyoning buyuk tog\' ko\'li qumli plyajlarida, qorli cho\'qqilar qurshovida dam oling', vibe: '$220 dan boshlab, 3 kun / 2 kecha.', duration: '3 kun / 2 kecha' },
      ru: { title: 'Иссык-Куль (Кыргызстан)', description: 'Отдохните на песчаных пляжах великого горного озера Центральной Азии в окружении заснеженных вершин', vibe: 'От $220, 3 дня / 2 ночи.', duration: '3 дня / 2 ночи' }
    }
  },
  {
    local_id: 5, type: 'international', category: 'nature',
    title: 'Sari-Chelek Nature Escape (Kyrgyzstan)',
    description: 'Trek through the pristine Sari-Chelek Biosphere Reserve with its turquoise lakes and forested peaks',
    image: '/images/dilrabo/sarichelek-qirgiziston.jpg',
    duration: '3 days / 2 nights', price: 95, rating: 4.8,
    country: 'Kyrgyzstan', hotel: 'Guesthouse', flight_included: false,
    included: ['Transportation', 'Accommodation', 'Guide'],
    vibe: 'Hike above a chain of glacial lakes ringed by snow-dusted mountains — a hidden gem for nature lovers.',
    translations: {
      uz: { title: 'Sari-Chelek (Qirg\'iziston)', description: 'Sari-Chelek biosfera qo\'riqxonasining ko\'k ko\'llari va o\'rmonli cho\'qqilari bo\'ylab treking', vibe: '$95 dan boshlab, 3 kun / 2 kecha.', duration: '3 kun / 2 kecha' },
      ru: { title: 'Сары-Челек (Кыргызстан)', description: 'Треккинг по нетронутому биосферному заповеднику Сары-Челек с бирюзовыми озёрами и лесистыми вершинами', vibe: 'От $95, 3 дня / 2 ночи.', duration: '3 дня / 2 ночи' }
    }
  },
  {
    local_id: 6, type: 'international', category: 'nature',
    title: 'Qora-Qoy Mountain Yurt Camp (Kyrgyzstan)',
    description: 'A one-day escape to a scenic yurt camp tucked between pine forests and snow-capped peaks',
    image: '/images/dilrabo/qoraqoy-qirgiziston.jpg',
    duration: '1 day', price: 20, rating: 4.7,
    country: 'Kyrgyzstan', hotel: 'Yurt Camp', flight_included: false,
    included: ['Transportation', 'Guide'],
    vibe: 'Spend the day among traditional yurts on a green alpine meadow surrounded by dramatic mountain scenery.',
    translations: {
      uz: { title: 'Qora-Qo\'y (Qirg\'iziston)', description: 'Qarag\'ay o\'rmonlari va qorli cho\'qqilar orasidagi manzarali yurta lageriga bir kunlik sayohat', vibe: '245.000 so\'mdan boshlab, 1 kun.', duration: '1 kun' },
      ru: { title: 'Кара-Кой (Кыргызстан)', description: 'Однодневная поездка в живописный юрточный лагерь среди сосновых лесов и заснеженных вершин', vibe: 'От 245 000 сум, 1 день.', duration: '1 день' }
    }
  },
  {
    local_id: 7, type: 'international', category: 'culture',
    title: 'Baku Discovery (Azerbaijan)',
    description: 'Explore the Flame Towers, the Old City, and the Caspian seafront of Azerbaijan\'s capital',
    image: '/images/dilrabo/azerbaijan-baku.jpg',
    duration: '4 days / 3 nights', price: 377, rating: 4.7,
    country: 'Azerbaijan', hotel: 'City Hotel', flight_included: true,
    included: ['Flight', 'Hotel', 'Breakfast', 'City Tour', 'Transportation'],
    vibe: 'Wander the cobblestone streets of Icherisheher by day and watch the Flame Towers glow at night.',
    translations: {
      uz: { title: 'Boku (Ozarbayjon)', description: 'Ozarbayjon poytaxtidagi Alanga minoralari, Eski shahar va Kaspiy dengizi bo\'yini kashf eting', vibe: '$377 dan boshlab, 4 kun / 3 kecha.', duration: '4 kun / 3 kecha' },
      ru: { title: 'Баку (Азербайджан)', description: 'Откройте для себя Пламенные башни, Старый город и набережную Каспия в столице Азербайджана', vibe: 'От $377, 4 дня / 3 ночи.', duration: '4 дня / 3 ночи' }
    }
  },
  {
    local_id: 8, type: 'international', category: 'adventure',
    title: 'Kuala Lumpur Explorer (Malaysia)',
    description: 'Urban adventure in Malaysia\'s vibrant capital, from the Petronas Towers to lush rainforest day trips',
    image: '/images/dilrabo/malaysia-kualalumpur.jpg',
    duration: '5 days / 4 nights', price: 559, rating: 4.7,
    country: 'Malaysia', hotel: '4-Star City Hotel', flight_included: true,
    included: ['Flight', 'Hotel', 'Breakfast', 'City Tours', 'Transportation'],
    vibe: 'From the Petronas Towers skyline to buzzing night markets, feel the energy of Southeast Asia.',
    translations: {
      uz: { title: 'Kuala-Lumpur (Malayziya)', description: 'Malayziyaning jonli poytaxtida sarguzasht — Petronas minoralaridan tropik o\'rmon safarigacha', vibe: '$559 dan boshlab, 5 kun / 4 kecha.', duration: '5 kun / 4 kecha' },
      ru: { title: 'Куала-Лумпур (Малайзия)', description: 'Городское приключение в яркой столице Малайзии — от башен Петронас до тропического леса', vibe: 'От $559, 5 дней / 4 ночи.', duration: '5 дней / 4 ночи' }
    }
  },
  {
    local_id: 9, type: 'international', category: 'culture',
    title: 'Tbilisi Heritage Trip (Georgia)',
    description: 'Discover Tbilisi\'s Old Town, sulfur baths, and the wine country of the Caucasus',
    image: '/images/dilrabo/georgia-tbilisi.jpg',
    duration: '5 days / 4 nights', price: 460, rating: 4.8,
    country: 'Georgia', hotel: 'City Hotel', flight_included: true,
    included: ['Flight', 'Hotel', 'Breakfast', 'City Tour', 'Wine Tasting', 'Transportation'],
    vibe: 'Stroll past Tbilisi\'s balconied old houses and sulfur bathhouses, then taste Georgia\'s famous wines.',
    translations: {
      uz: { title: 'Tbilisi (Gruziya)', description: 'Tbilisining Eski shahri, oltingugurt hammomlari va Kavkaz sharob diyorini kashf eting', vibe: '$460 dan boshlab, 5 kun / 4 kecha.', duration: '5 kun / 4 kecha' },
      ru: { title: 'Тбилиси (Грузия)', description: 'Откройте для себя Старый город Тбилиси, серные бани и винный край Кавказа', vibe: 'От $460, 5 дней / 4 ночи.', duration: '5 дней / 4 ночи' }
    }
  },
];

const allPackages = [...domesticPackages, ...internationalPackages];

async function seedTourCompanies(client) {
  const companyIdByKey = {};
  const placeholderHash = await bcrypt.hash('ChangeMe123!', 10);
  for (const company of defaultTourCompanies) {
    const { rows } = await client.query(
      `INSERT INTO tour_companies (name, email, password_hash, phone, address, website, description, status, logo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'approved',$8)
       ON CONFLICT (email) DO UPDATE SET status = 'approved', logo = EXCLUDED.logo
       RETURNING id`,
      [company.name, company.email, placeholderHash, company.phone, company.address, company.website, company.description, company.logo || null]
    );
    companyIdByKey[company.key] = rows[0].id;
  }
  console.log(`Seeded ${defaultTourCompanies.length} default tour companies.`);
  return companyIdByKey;
}

async function seed() {
  const client = await pool.connect();
  try {
    const companyIdByKey = await seedTourCompanies(client);
    const companyKeys = defaultTourCompanies.map((c) => c.key);

    // Clear existing packages
    await client.query('DELETE FROM packages');
    console.log('Existing packages cleared.');

    let companyAssignIndex = 0;
    for (const pkg of allPackages) {
      // The self-service "create your own package" placeholder isn't tied to a real tour firm
      const companyKey = pkg.category === 'combo' ? null : companyKeys[companyAssignIndex++ % companyKeys.length];
      const companyId = companyKey ? companyIdByKey[companyKey] : null;

      await client.query(
        `INSERT INTO packages
          (local_id, type, category, title, description, image, duration, price, rating,
           included, country, hotel, flight_included, vibe, video, interests, partners, translations, company_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          pkg.local_id,
          pkg.type,
          pkg.category || null,
          pkg.title,
          pkg.description || null,
          pkg.image || null,
          pkg.duration || null,
          pkg.price || 0,
          pkg.rating || 0,
          pkg.included || [],
          pkg.country || null,
          pkg.hotel || null,
          pkg.flight_included || false,
          pkg.vibe || null,
          pkg.video || null,
          pkg.interests || null,
          pkg.partners || null,
          JSON.stringify(pkg.translations || {}),
          companyId,
        ]
      );
    }
    console.log(`Seeded ${allPackages.length} packages successfully.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
