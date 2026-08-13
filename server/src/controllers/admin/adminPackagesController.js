const { Package, TourCompany, Booking } = require('../../models');
const XLSX = require('xlsx');
const mammoth = require('mammoth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../../uploads/imports/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|docx|doc)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat Excel yoki Word formatdagi fayllarni yuklashingiz mumkin'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

function normalizeHeader(h) {
  return String(h || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function findCol(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const h = normalizeHeader(headers[i]);
    if (keywords.some(k => h.includes(k))) return i;
  }
  return -1;
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return data;
}

async function parseWord(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const lines = result.value.split(/\r?\n/).filter(l => l.trim());
  const rows = lines.map(l => l.split(/\t| {2,}/).map(c => c.trim()));
  const maxCols = Math.max(...rows.map(r => r.length), 0);
  const normalized = rows.map(r => {
    while (r.length < maxCols) r.push('');
    return r;
  });
  if (normalized.length === 0) return [];
  return { rows: normalized, isWord: true };
}

function mapPackageRow(row, headers) {
  const isWord = row._isWord;
  let titleIdx, typeIdx, categoryIdx, descIdx, durationIdx, priceIdx, currencyIdx, countryIdx, hotelIdx, flightIdx, includedIdx, interestsIdx;

  if (isWord) {
    titleIdx = findCol(headers, ['tur nomi', 'title', 'nom', 'nomi']);
    typeIdx = findCol(headers, ['tur turi', 'type', 'turi']);
    categoryIdx = findCol(headers, ['kategoriya', 'category']);
    descIdx = findCol(headers, ['tavsif', 'description', 'ma\'lumot', 'malumot']);
    durationIdx = findCol(headers, ['davomiyligi', 'duration', 'kun', 'kuni']);
    priceIdx = findCol(headers, ['narx', 'price']);
    currencyIdx = findCol(headers, ['valyuta', 'currency']);
    countryIdx = findCol(headers, ['mamlakat', 'country']);
    hotelIdx = findCol(headers, ['mehmonxona', 'hotel']);
    flightIdx = findCol(headers, ['aviachipta', 'flight', 'uchish']);
    includedIdx = findCol(headers, ['nimalar kiradi', 'included', 'xizmatlar']);
    interestsIdx = findCol(headers, ['qiziqishlar', 'interests', 'qiziqish']);
  } else {
    titleIdx = findCol(Object.keys(row), ['tur nomi', 'title', 'nom', 'nomi']);
    typeIdx = findCol(Object.keys(row), ['tur turi', 'type', 'turi']);
    categoryIdx = findCol(Object.keys(row), ['kategoriya', 'category']);
    descIdx = findCol(Object.keys(row), ['tavsif', 'description', 'ma\'lumot', 'malumot']);
    durationIdx = findCol(Object.keys(row), ['davomiyligi', 'duration', 'kun', 'kuni']);
    priceIdx = findCol(Object.keys(row), ['narx', 'price']);
    currencyIdx = findCol(Object.keys(row), ['valyuta', 'currency']);
    countryIdx = findCol(Object.keys(row), ['mamlakat', 'country']);
    hotelIdx = findCol(Object.keys(row), ['mehmonxona', 'hotel']);
    flightIdx = findCol(Object.keys(row), ['aviachipta', 'flight', 'uchish']);
    includedIdx = findCol(Object.keys(row), ['nimalar kiradi', 'included', 'xizmatlar']);
    interestsIdx = findCol(Object.keys(row), ['qiziqishlar', 'interests', 'qiziqish']);
  }

  const get = (idx) => {
    if (idx < 0) return '';
    if (isWord) return row[idx] || '';
    const key = Object.keys(row)[idx];
    return row[key] != null ? String(row[key]) : '';
  };

  return {
    title: get(titleIdx),
    type: get(typeIdx),
    category: get(categoryIdx),
    description: get(descIdx),
    duration: get(durationIdx),
    price: get(priceIdx),
    price_currency: get(currencyIdx),
    country: get(countryIdx),
    hotel: get(hotelIdx),
    flight_included: get(flightIdx),
    included: get(includedIdx),
    interests: get(interestsIdx),
  };
}

function parseDate(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function toBool(val) {
  if (typeof val === 'boolean') return val;
  const s = String(val).toLowerCase().trim();
  return ['ha', 'yes', 'true', '1', 'bor', 'true'].includes(s);
}

function toType(val) {
  const s = String(val).toLowerCase().trim();
  if (s.includes('xalqaro') || s.includes('international')) return 'international';
  if (s.includes('combo') || s.includes('kombi')) return 'combo';
  if (s.includes('ichki') || s.includes('domestic') || s.includes('mahalliy')) return 'domestic';
  if (['domestic', 'international', 'combo'].includes(s)) return s;
  return 'domestic';
}

function toCategory(val) {
  const s = String(val).toLowerCase().trim();
  const map = {
    'tarixiy': 'historical', 'historical': 'historical',
    'tabiat': 'nature', 'nature': 'nature',
    'plyaj': 'beach', 'beach': 'beach', 'play': 'beach',
    'sarguzasht': 'adventure', 'adventure': 'adventure',
    'madaniyat': 'culture', 'culture': 'culture',
    'biznes': 'business', 'business': 'business',
    'oilaviy': 'family', 'family': 'family',
    'hashamatli': 'luxury', 'luxury': 'luxury',
  };
  return map[s] || s || '';
}

function toCurrency(val) {
  const s = String(val).toLowerCase().trim();
  if (s.includes('uzs') || s.includes("so'm") || s.includes('sum')) return 'UZS';
  if (s.includes('usd') || s.includes('$')) return 'USD';
  if (['USD', 'UZS'].includes(s.toUpperCase())) return s.toUpperCase();
  return 'USD';
}

async function importPackages(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fayl yuklanishi shart' });
    }

    const buffer = fs.readFileSync(req.file.path);
    const ext = path.extname(req.file.originalname).toLowerCase();
    let rawRows, headers;

    if (ext === '.docx' || ext === '.doc') {
      const parsed = await parseWord(buffer);
      rawRows = parsed.rows;
      headers = rawRows[0] || [];
      rawRows = rawRows.slice(1);
      rawRows.forEach(r => r._isWord = true);
    } else {
      rawRows = parseExcel(buffer);
      headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = mapPackageRow(rawRows[i], headers);
      const rowNum = i + 2;

      if (!row.title) {
        errors.push({ row: rowNum, error: "Tur nomi to'ldirilishi shart" });
        continue;
      }

      try {
        const pkg = new Package({
          type: toType(row.type),
          category: toCategory(row.category),
          title: row.title.trim(),
          description: row.description ? row.description.trim() : '',
          duration: row.duration ? row.duration.trim() : '',
          price: parseFloat(row.price) || 0,
          price_currency: toCurrency(row.price_currency),
          country: row.country ? row.country.trim() : '',
          hotel: row.hotel ? row.hotel.trim() : '',
          flight_included: toBool(row.flight_included),
          included: row.included ? row.included.split(',').map((s) => s.trim()).filter(Boolean) : [],
          interests: row.interests ? row.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
          company_id: req.user?.role === 'admin' ? (req.user.company_id || null) : null,
        });

        await pkg.save();

        results.push({
          row: rowNum,
          title: pkg.title,
          type: pkg.type,
          company_id: pkg.company_id,
        });
      } catch (err) {
        console.error(`Row ${rowNum} error:`, err);
        errors.push({ row: rowNum, error: err.message || 'Server error' });
      }
    }

    try { fs.unlinkSync(req.file.path); } catch {}

    return res.json({ imported: results.length, results, errors });
  } catch (err) {
    console.error('Import error:', err);
    try { if (req.file) fs.unlinkSync(req.file.path); } catch {}
    return res.status(500).json({ error: 'Import qilishda xatolik: ' + err.message });
  }
}

async function getPackages(req, res) {
  try {
    let filter = {};
    if (req.user.role === 'admin' && req.user.company_id) {
      filter = { company_id: req.user.company_id };
    }

    const packages = await Package.find(filter).sort({ created_at: -1 });

    const companyIds = [...new Set(packages.map(p => p.company_id).filter(Boolean))];
    const companies = await TourCompany.find({ id: { $in: companyIds } });
    const companyMap = new Map(companies.map(c => [c.id, c]));

    const result = packages.map(p => ({
      ...p.toObject(),
      company_name: companyMap.get(p.company_id)?.name || null,
      company_logo: companyMap.get(p.company_id)?.logo || null,
    }));

    return res.json({ packages: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createPackage(req, res) {
  try {
    const {
      type, category, title, description, image, duration,
      price, rating, included, country, start_date, end_date, valid_dates, hotel, flight_included,
      vibe, interests, partners, translations, company_id, price_currency,
      country1, country2, destination1, destination2, comboStops
    } = req.body;

    const finalImage = image || null;

    const effectiveCompanyId = req.user.role === 'admin'
      ? (req.user.company_id || null)
      : (company_id || null);

    const parsedTranslations = typeof translations === 'string'
      ? JSON.parse(translations || '{}')
      : (translations || {});

    const parsedIncluded = typeof included === 'string'
      ? JSON.parse(included || '[]')
      : (included || []);
    const parsedInterests = typeof interests === 'string'
      ? JSON.parse(interests || '[]')
      : (interests || []);
    const parsedFlightIncluded = typeof flight_included === 'string'
      ? flight_included === 'true'
      : (flight_included || false);

    const parsedValidDates = Array.isArray(valid_dates)
      ? valid_dates.map((d) => new Date(d))
      : [];

    const parsedComboStops = Array.isArray(comboStops)
      ? comboStops
      : [];
    const finalCountry1 = parsedComboStops[0]?.country || country1 || null;
    const finalDestination1 = parsedComboStops[0]?.destination || destination1 || null;
    const finalCountry2 = parsedComboStops[1]?.country || country2 || null;
    const finalDestination2 = parsedComboStops[1]?.destination || destination2 || null;

    const pkg = new Package({
      type: type || 'domestic',
      category,
      title,
      description,
      image: finalImage,
      duration,
      price: price || 0,
      rating: rating || 0,
      included: parsedIncluded,
      country,
      start_date: start_date || (parsedValidDates[0] || null),
      end_date: end_date || (parsedValidDates[parsedValidDates.length - 1] || null),
      valid_dates: parsedValidDates,
      hotel,
      flight_included: parsedFlightIncluded,
      vibe,
      interests: parsedInterests,
      partners: partners || [],
      translations: parsedTranslations,
      company_id: effectiveCompanyId,
      price_currency: price_currency || 'USD',
    });

    await pkg.save();
    return res.json({ package: pkg.toObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updatePackage(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role === 'admin' && req.user.company_id) {
      const pkg = await Package.findOne({ id: parseInt(id) });
      if (!pkg) return res.status(404).json({ error: 'Package not found' });
      if (pkg.company_id !== req.user.company_id) {
        return res.status(403).json({ error: 'Bu paket sizga tegishli emas' });
      }
    }

    const {
      type, category, title, description, image, duration,
      price, rating, included, country, start_date, end_date, valid_dates, hotel, flight_included,
      vibe, interests, partners, translations, price_currency,
      country1, country2, destination1, destination2, comboStops
    } = req.body;

    const finalImage = image || null;

    const parsedTranslations = typeof translations === 'string'
      ? JSON.parse(translations || '{}')
      : (translations || {});

    const parsedIncluded = typeof included === 'string'
      ? JSON.parse(included || '[]')
      : (included || []);
    const parsedInterests = typeof interests === 'string'
      ? JSON.parse(interests || '[]')
      : (interests || []);
    const parsedFlightIncluded = typeof flight_included === 'string'
      ? flight_included === 'true'
      : (flight_included || false);

    const parsedValidDates = Array.isArray(valid_dates)
      ? valid_dates.map((d) => new Date(d))
      : [];

    const parsedComboStops = Array.isArray(comboStops)
      ? comboStops
      : [];
    const finalCountry1 = parsedComboStops[0]?.country || country1 || null;
    const finalDestination1 = parsedComboStops[0]?.destination || destination1 || null;
    const finalCountry2 = parsedComboStops[1]?.country || country2 || null;
    const finalDestination2 = parsedComboStops[1]?.destination || destination2 || null;

    const updated = await Package.findOneAndUpdate(
      { id: parseInt(id) },
      {
        type: type || 'domestic',
        category,
        title,
        description,
        image: finalImage,
        duration,
        price: price || 0,
        rating: rating || 0,
        included: parsedIncluded,
        country,
        start_date: start_date || (parsedValidDates[0] || null),
        end_date: end_date || (parsedValidDates[parsedValidDates.length - 1] || null),
        valid_dates: parsedValidDates,
        hotel,
        flight_included: parsedFlightIncluded,
        vibe,
        interests: parsedInterests,
        partners: partners || [],
        translations: parsedTranslations,
        price_currency: price_currency || 'USD',
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Package not found' });
    return res.json({ package: updated.toObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deletePackage(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role === 'admin' && req.user.company_id) {
      const pkg = await Package.findOne({ id: parseInt(id) });
      if (!pkg) return res.status(404).json({ error: 'Package not found' });
      if (pkg.company_id !== req.user.company_id) {
        return res.status(403).json({ error: 'Bu paket sizga tegishli emas' });
      }
    }

    const deleted = await Package.findOneAndDelete({ id: parseInt(id) });
    if (!deleted) return res.status(404).json({ error: 'Package not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function assignPackageCompany(req, res) {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Faqat super admin' });
    }
    const { id } = req.params;
    const { company_id } = req.body;
    const newCompanyId = company_id || null;

    const pkg = await Package.findOneAndUpdate(
      { id: parseInt(id) },
      { company_id: newCompanyId },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    await Booking.updateMany(
      { title: pkg.title },
      { company_id: newCompanyId }
    ).catch(() => {});

    return res.json({ updated: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getPackages, createPackage, updatePackage, deletePackage, assignPackageCompany, importPackages, upload };
