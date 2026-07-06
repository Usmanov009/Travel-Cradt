const { Telegraf, Markup, session } = require('telegraf');
const Groq = require('groq-sdk');
const pool = require('./db');
const { normalizePhone } = require('./utils/phone');

const MODEL = 'llama-3.3-70b-versatile';

const STATIC_DOMESTIC = [
  { local_id: 1, title: "Samarqand — Shohlar shahri", price: 299, duration: '3 kun', rating: 4.9, description: "Registon maydoni, Shah-i-Zinda, Gur-e-Amir maqbarasi." },
  { local_id: 2, title: "Buxoro — Ipak yo'li gavhari", price: 259, duration: '3 kun', rating: 4.8, description: "Ko'hna shahar, Kalon minorasi, Ark qal'asi." },
  { local_id: 3, title: "Xiva — Muzey shahar", price: 279, duration: '2 kun', rating: 4.7, description: "Ichan-Qal'a, Islam Xo'ja minorasi, Pahlavon Mahmud maqbarasi." },
  { local_id: 4, title: "Toshkent — Poytaxt sarguzashti", price: 199, duration: '2 kun', rating: 4.6, description: "Xazrati Imom, Chorsu bozori, Toshkent Metro muzeyи." },
  { local_id: 5, title: "Chimgan — Tog' sarguzashti", price: 149, duration: '2 kun', rating: 4.5, description: "Ski kurort, tog' yurishlari, Charvak ko'li." },
  { local_id: 6, title: "Shahrisabz — Temur vatani", price: 229, duration: '2 kun', rating: 4.6, description: "Oq-Saroy saroyi, Dorut-Tilavat majmuasi." },
];

const STATIC_INTERNATIONAL = [
  { local_id: 1, title: "Dubai — Zamonaviy mo'jiza", price: 899, duration: '5 kun', rating: 4.9, description: "Burj Khalifa, Desert Safari, Dubai Mall." },
  { local_id: 2, title: "Phuket — Tailand jannat", price: 799, duration: '7 kun', rating: 4.8, description: "Patong Beach, Phi Phi orollari, Wat Chalong." },
  { local_id: 3, title: "Istanbul — Ikki dunyo ko'prigi", price: 649, duration: '5 kun', rating: 4.7, description: "Aya Sofiya, Topqapi saroyi, Bosphorus kruizi." },
  { local_id: 4, title: "Maldiv — Okean jannat", price: 1299, duration: '6 kun', rating: 4.9, description: "Suv usti bungalovlar, snorkeling, sunset cruise." },
  { local_id: 5, title: "Santorini — Yunon orollar", price: 1099, duration: '6 kun', rating: 4.8, description: "Oia qishlog'i, vulqon sohillari, sharoblar." },
  { local_id: 6, title: "Bali — Tanrular oroli", price: 749, duration: '7 kun', rating: 4.8, description: "Ubud o'rmon, Tanah Lot, gurme ovqatlanish." },
];

function getGroq() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function getWebAppUrl() {
  const url = process.env.WEB_APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'https://travel-ai-61u0.onrender.com';
  return url.replace(/\/$/, '');
}

async function getTelegramUser(telegramId) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM telegram_users WHERE telegram_id = $1',
      [String(telegramId)]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function saveTelegramUser(telegramId, name, phone, username, firstName) {
  try {
    await pool.query(
      `INSERT INTO telegram_users (telegram_id, name, phone, username, first_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (telegram_id) DO UPDATE
         SET name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             username = EXCLUDED.username`,
      [String(telegramId), name, phone, username || null, firstName || null]
    );
  } catch (err) {
    console.error('Foydalanuvchi saqlash xatosi:', err.message);
  }
}

async function getPackagesFromDB(type) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM packages WHERE type = $1 ORDER BY rating DESC LIMIT 8',
      [type]
    );
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

async function getPackageByLocalId(type, localId) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM packages WHERE type = $1 AND local_id = $2 LIMIT 1',
      [type, localId]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

function formatPackageDetail(pkg, type) {
  const emoji = type === 'domestic' ? '🏛' : '🌏';
  const included = pkg.included ? pkg.included.slice(0, 4).map(i => `• ${i}`).join('\n') : '';
  return (
    `${emoji} *${escMd(pkg.title)}*\n\n` +
    `⏱ *Davomiyligi:* ${escMd(String(pkg.duration || '-'))}\n` +
    `💰 *Narx:* $${pkg.price}\n` +
    `⭐ *Reyting:* ${pkg.rating || '-'}/5\n` +
    (pkg.hotel ? `🏨 *Mehmonxona:* ${escMd(pkg.hotel)}\n` : '') +
    (included ? `\n✅ *Kiradi:*\n${included}\n` : '') +
    `\n📝 ${escMd(pkg.description || '')}`
  );
}

function escMd(text) {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function categoryGridKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🏛 Ichki turlar', 'cat_domestic'),
      Markup.button.callback('🌏 Xalqaro turlar', 'cat_international'),
    ],
    [
      Markup.button.callback('✨ Combo turlar', 'cat_combo'),
      Markup.button.callback('🏠 Ijaralar', 'cat_rentals'),
    ],
  ]);
}

function mainMenuKeyboard() {
  const url = getWebAppUrl();
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🌐 Web Ilovani ochish', url)],
    ...categoryGridKeyboard().reply_markup.inline_keyboard,
    [Markup.button.callback('🤖 AI Maslahat', 'ai_start')],
    [Markup.button.callback('❓ Yordam', 'help')],
  ]);
}

function phoneRequestKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📱 Telefon raqamni ulashish', request_contact: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

function createBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn('⚠️  BOT_TOKEN topilmadi — Telegram bot ishlamaydi');
    return null;
  }

  const bot = new Telegraf(token);
  bot.use(session());

  // ─── /start ────────────────────────────────────────────
  bot.start(async (ctx) => {
    ctx.session = {};
    const telegramId = ctx.from.id;
    const existingUser = await getTelegramUser(telegramId);

    if (existingUser) {
      const name = existingUser.name || ctx.from.first_name || 'Mehmon';
      await ctx.reply(
        `✈️ *Xush kelibsiz, ${escMd(name)}\\!*\n\n` +
        `🌍 *TravelCraft AI* — aqlli sayohat rejalashtiruvchi\n\n` +
        `Siz nima qilmoqchisiz?`,
        { parse_mode: 'MarkdownV2', ...mainMenuKeyboard() }
      );
    } else {
      ctx.session.state = 'awaiting_phone';
      await ctx.reply(
        `✈️ *TravelCraft AI* ga xush kelibsiz\\!\n\n` +
        `Davom etish uchun telefon raqamingizni ulashing:\n\n` +
        `_Quyidagi tugmani bosing_ 👇`,
        {
          parse_mode: 'MarkdownV2',
          ...phoneRequestKeyboard(),
        }
      );
    }
  });

  // ─── Telefon raqam qabul qilish ────────────────────────
  bot.on('contact', async (ctx) => {
    const contact = ctx.message.contact;

    // Faqat o'z raqamini qabul qilamiz
    if (contact.user_id && contact.user_id !== ctx.from.id) {
      await ctx.reply('❌ Faqat o\'z telefon raqamingizni ulashishingiz mumkin.');
      return;
    }

    ctx.session = ctx.session || {};
    ctx.session.phone = normalizePhone(contact.phone_number);
    ctx.session.state = 'awaiting_name';

    await ctx.reply(
      `✅ *Telefon qabul qilindi\\!*\n\n` +
      `👤 Endi *to\'liq ismingizni* kiriting:\n` +
      `_Masalan: Alisher Karimov_`,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: { remove_keyboard: true },
      }
    );
  });

  // ─── Check User Registration ────────────────────────────
  const checkUserRegistration = async (ctx) => {
    const existingUser = await getTelegramUser(ctx.from.id);
    if (!existingUser) {
      ctx.session.state = 'awaiting_phone';
      await ctx.reply(
        `⚠️ *Avvalo ro'yxatdan o'tishingiz kerak\\!*\n\n` +
        `Telefon raqamingizni ulashing:`,
        {
          parse_mode: 'MarkdownV2',
          ...phoneRequestKeyboard(),
        }
      );
      return false;
    }
    return true;
  };

  // ─── /help ─────────────────────────────────────────────
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 *Yordam*\n\n` +
      `*Buyruqlar:*\n` +
      `/start — Bosh menyu\n` +
      `/packages — Turlar kategoriyalari\n` +
      `/domestic — Ichki turlar \\(O'zbekiston\\)\n` +
      `/international — Xalqaro turlar\n` +
      `/ai — AI maslahatchi\n` +
      `/help — Ushbu yordam\n\n` +
      `💡 Yoki shunchaki *menga yozing* — AI sizga javob beradi\\!`,
      { parse_mode: 'MarkdownV2' }
    );
  });

  // ─── /packages ─────────────────────────────────────────
  bot.command('packages', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.reply(
      '📦 *Qaysi tur kategoriyasini ko\'rmoqchisiz?*',
      {
        parse_mode: 'MarkdownV2',
        ...categoryGridKeyboard(),
      }
    );
  });

  // ─── /domestic ─────────────────────────────────────────
  bot.command('domestic', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await showPackageList(ctx, 'domestic');
  });

  // ─── /international ────────────────────────────────────
  bot.command('international', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await showPackageList(ctx, 'international');
  });

  // ─── /ai ───────────────────────────────────────────────
  bot.command('ai', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    ctx.session = ctx.session || {};
    ctx.session.messages = [];
    await ctx.reply(
      '🤖 *TravelCraft AI Maslahatchi*\n\n' +
      'Menga sayohat haqida savolingizni yozing\\!\n\n' +
      '_Masalan: "Samarqandga qachon borish yaxshi?" yoki "Dubai uchun byudjet qancha?"_',
      { parse_mode: 'MarkdownV2' }
    );
  });

  // ─── Callbacks ─────────────────────────────────────────
  bot.action('cat_domestic', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.answerCbQuery();
    await showPackageList(ctx, 'domestic');
  });

  bot.action('cat_international', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.answerCbQuery();
    await showPackageList(ctx, 'international');
  });

  bot.action('cat_combo', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.answerCbQuery();
    const url = getWebAppUrl();
    await ctx.reply(
      '✨ *Combo turlar*\n\nBitta safarda ikki mamlakat — premium marshrutlar\\.',
      {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🔍 Combo turlarni ko\'rish', `${url}/combo-tours`)],
          [Markup.button.callback('🏠 Bosh menyu', 'main_menu')],
        ]),
      }
    );
  });

  bot.action('cat_rentals', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.answerCbQuery();
    const url = getWebAppUrl();
    await ctx.reply(
      '🏠 *Ijaralar*\n\nUy, kvartira yoki avtomobil ijarasi\\.',
      {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          [
            Markup.button.webApp('🏠 Uy ijarasi', `${url}/house-rent`),
            Markup.button.webApp('🚗 Mashina', `${url}/car-rent`),
          ],
          [Markup.button.callback('🏠 Bosh menyu', 'main_menu')],
        ]),
      }
    );
  });

  bot.action('ai_start', async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.answerCbQuery();
    ctx.session = ctx.session || {};
    ctx.session.messages = [];
    await ctx.reply(
      '🤖 *TravelCraft AI Maslahatchi*\n\n' +
      'Menga sayohat haqida savolingizni yozing\\!\n\n' +
      '_Masalan: "Samarqandga qachon borish yaxshi?"_\n\n' +
      'Chiqish uchun /start yozing\\.',
      { parse_mode: 'MarkdownV2' }
    );
  });

  bot.action('help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `📖 *Yordam*\n\n` +
      `/start — Bosh menyu\n` +
      `/packages — Turlar kategoriyalari\n` +
      `/domestic — Ichki turlar\n` +
      `/international — Xalqaro turlar\n` +
      `/ai — AI maslahatchi\n\n` +
      `💡 Yoki shunchaki *menga yozing* — AI sizga javob beradi\\!`,
      { parse_mode: 'MarkdownV2' }
    );
  });

  bot.action('main_menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      '🏠 *Bosh menyu*',
      { parse_mode: 'MarkdownV2', ...mainMenuKeyboard() }
    );
  });

  // pkg_domestic_1, pkg_international_3 ...
  bot.action(/^pkg_(domestic|international)_(\d+)$/, async (ctx) => {
    const isRegistered = await checkUserRegistration(ctx);
    if (!isRegistered) return;
    await ctx.answerCbQuery();
    const type = ctx.match[1];
    const localId = parseInt(ctx.match[2]);
    await showPackageDetail(ctx, type, localId);
  });

  // ─── Text xabarlari ────────────────────────────────────
  bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    ctx.session = ctx.session || {};

    // Ro'yxatdan o'tish: ism kutilmoqda
    if (ctx.session.state === 'awaiting_name') {
      const name = ctx.message.text.trim();
      if (name.length < 2) {
        await ctx.reply('❌ Iltimos, to\'liq ismingizni kiriting \\(kamida 2 harf\\)\\.', { parse_mode: 'MarkdownV2' });
        return;
      }

      const phone = ctx.session.phone || '';
      await saveTelegramUser(ctx.from.id, name, phone, ctx.from.username, ctx.from.first_name);

      ctx.session.state = null;
      ctx.session.phone = null;

      await ctx.reply(
        `🎉 *Ro'yxatdan o'tdingiz\\!*\n\n` +
        `👤 Ism: *${escMd(name)}*\n` +
        `📱 Tel: *${escMd(phone)}*\n\n` +
        `Endi sayohat rejalashtirish boshlang\\!`,
        { parse_mode: 'MarkdownV2', ...mainMenuKeyboard() }
      );
      return;
    }

    // Ro'yxatdan o'tish: telefon kutilmoqda
    if (ctx.session.state === 'awaiting_phone') {
      await ctx.reply(
        '📱 Iltimos, quyidagi tugmani bosib telefon raqamingizni ulashing:',
        phoneRequestKeyboard()
      );
      return;
    }

    // AI chat
    const groq = getGroq();
    if (!groq) {
      return ctx.reply(
        '⚠️ AI xizmati hozir sozlanmagan.\n\nWeb ilovada AI Chat dan foydalaning:',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🌐 Web Ilovani ochish', getWebAppUrl())],
        ])
      );
    }

    if (!Array.isArray(ctx.session.messages)) ctx.session.messages = [];

    ctx.session.messages.push({ role: 'user', content: ctx.message.text });
    if (ctx.session.messages.length > 12) {
      ctx.session.messages = ctx.session.messages.slice(-12);
    }

    await ctx.sendChatAction('typing');

    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              "Sen TravelCraft AI — O'zbekiston va xalqaro sayohat bo'yicha bilimli va do'stona sayohat maslahatchisisiz. " +
              "Foydalanuvchilarga quyidagilarda yordam bering: yo'nalish haqida ma'lumot, sayohat maslahatlari, " +
              "tashrif uchun eng yaxshi fasllar, viza talablari, taxminiy narxlar (USD), madaniy maslahatlar, " +
              "narxlar, marshrutlar. O'zbek tilida javob bering. Qisqa va foydali bo'ling (max 3 paragraf). " +
              "Emoji ishlatishingiz mumkin.",
          },
          ...ctx.session.messages,
        ],
        max_tokens: 450,
      });

      const reply = completion.choices[0].message.content;
      ctx.session.messages.push({ role: 'assistant', content: reply });

      await ctx.reply(reply, {
        ...Markup.inlineKeyboard([
          ...categoryGridKeyboard().reply_markup.inline_keyboard,
          [Markup.button.webApp('🌐 Web Ilovani ochish', getWebAppUrl())],
        ]),
      });
    } catch (err) {
      console.error('Bot AI xatosi:', err.message);
      await ctx.reply('❌ Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
    }
  });

  return bot;
}

async function showPackageList(ctx, type) {
  const emoji = type === 'domestic' ? '🏛' : '🌏';
  const title = type === 'domestic' ? "Ichki turlar \\(O'zbekiston\\)" : 'Xalqaro turlar';
  const url = getWebAppUrl();
  const pageUrl = type === 'domestic'
    ? `${url}/domestic-travel`
    : `${url}/international-travel`;

  let packages = await getPackagesFromDB(type);
  const list = packages || (type === 'domestic' ? STATIC_DOMESTIC : STATIC_INTERNATIONAL);

  const buttons = list.slice(0, 6).map(p => [
    Markup.button.callback(
      `${emoji} ${p.title} — $${p.price}`,
      `pkg_${type}_${p.local_id}`
    ),
  ]);
  buttons.push([Markup.button.webApp('🔍 Barchasini ko\'rish', pageUrl)]);
  buttons.push([Markup.button.callback('🏠 Bosh menyu', 'main_menu')]);

  await ctx.reply(
    `${emoji} *${title}*\n\nEng yaxshi paketlar \\— tanlang:`,
    { parse_mode: 'MarkdownV2', ...Markup.inlineKeyboard(buttons) }
  );
}

async function showPackageDetail(ctx, type, localId) {
  const url = getWebAppUrl();

  let pkg = await getPackageByLocalId(type, localId);
  if (!pkg) {
    const staticList = type === 'domestic' ? STATIC_DOMESTIC : STATIC_INTERNATIONAL;
    pkg = staticList.find(p => p.local_id === localId);
  }

  if (!pkg) {
    await ctx.reply('❌ Paket topilmadi.');
    return;
  }

  const text = formatPackageDetail(pkg, type);

  await ctx.reply(text, {
    parse_mode: 'MarkdownV2',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🎫 Band qilish', `${url}/package/${type}/${localId}`)],
      [Markup.button.callback(`◀️ Orqaga`, `cat_${type}`)],
      [Markup.button.callback('🏠 Bosh menyu', 'main_menu')],
    ]),
  });
}

module.exports = { createBot, getTelegramUser };
