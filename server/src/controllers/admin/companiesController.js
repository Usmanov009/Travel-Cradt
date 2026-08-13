const { TourCompany, Package, Booking } = require('../../models');
const bcrypt = require('bcryptjs');
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

function mapRow(row, headers) {
  const isWord = row._isWord;
  let nameIdx, phoneIdx, addressIdx, emailIdx, websiteIdx, descriptionIdx;

  if (isWord) {
    nameIdx = findCol(headers, ['firma', 'nom', 'name', 'kompaniya', 'company']);
    phoneIdx = findCol(headers, ['telefon', 'phone', 'tel']);
    addressIdx = findCol(headers, ['manzil', 'address', 'adres', 'joy']);
    emailIdx = findCol(headers, ['email', 'e-mail', 'pochta']);
    websiteIdx = findCol(headers, ['veb', 'website', 'sayt', 'web']);
    descriptionIdx = findCol(headers, ['tavsif', 'description', 'info', 'malumot']);
  } else {
    nameIdx = findCol(Object.keys(row), ['firma', 'nom', 'name', 'kompaniya', 'company']);
    phoneIdx = findCol(Object.keys(row), ['telefon', 'phone', 'tel']);
    addressIdx = findCol(Object.keys(row), ['manzil', 'address', 'adres', 'joy']);
    emailIdx = findCol(Object.keys(row), ['email', 'e-mail', 'pochta']);
    websiteIdx = findCol(Object.keys(row), ['veb', 'website', 'sayt', 'web']);
    descriptionIdx = findCol(Object.keys(row), ['tavsif', 'description', 'info', 'malumot']);
  }

  const get = (idx) => {
    if (idx < 0) return '';
    if (isWord) return row[idx] || '';
    const key = Object.keys(row)[idx];
    return row[key] != null ? String(row[key]) : '';
  };

  return {
    name: get(nameIdx),
    phone: get(phoneIdx),
    address: get(addressIdx),
    email: get(emailIdx),
    website: get(websiteIdx),
    description: get(descriptionIdx),
  };
}

async function createCompany(req, res) {
  try {
    const { name, phone, address, website, description, logo, email, password } = req.body;

    if (!name) return res.status(400).json({ error: 'Firma nomi talab qilinadi' });

    const companyData = {
      name: name.trim(),
      phone: phone || null,
      address: address || null,
      website: website || null,
      description: description || null,
      status: 'approved',
    };

    if (logo) companyData.logo = logo;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingCompany = await TourCompany.findOne({ email: normalizedEmail });
      if (existingCompany) return res.status(400).json({ error: 'Bu email allaqachon mavjud' });

      const existingUser = await require('../../models').User.findOne({ email: normalizedEmail });
      if (existingUser) return res.status(400).json({ error: 'Bu email allaqachon mavjud' });

      companyData.email = normalizedEmail;

      if (password && password.length >= 6) {
        const hash = bcrypt.hash(password, 10);
        companyData.password_hash = hash;

        const company = new TourCompany(companyData);
        await company.save();

        const user = new require('../../models').User({
          name: name.trim(),
          email: normalizedEmail,
          password_hash: hash,
          role: 'admin',
          company_id: company.id,
        });
        await user.save();

        return res.json({ company: { ...company.toObject(), user_created: true } });
      }
    }

    const company = new TourCompany(companyData);
    await company.save();

    return res.json({ company: company.toObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function importCompanies(req, res) {
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
      const row = mapRow(rawRows[i], headers);
      const rowNum = i + 2;

      if (!row.name) {
        errors.push({ row: rowNum, error: "Firma nomi to'ldirilishi shart" });
        continue;
      }

      try {
        const companyData = {
          name: row.name.trim(),
          phone: row.phone ? row.phone.trim() : null,
          address: row.address ? row.address.trim() : null,
          website: row.website ? row.website.trim() : null,
          description: row.description ? row.description.trim() : null,
          status: 'approved',
        };

        if (row.email) {
          const normalizedEmail = row.email.toLowerCase().trim();
          const existing = await TourCompany.findOne({ email: normalizedEmail });
          if (existing) {
            errors.push({ row: rowNum, error: `Bu email allaqachon mavjud: ${normalizedEmail}` });
            continue;
          }
          companyData.email = normalizedEmail;

          if (row.password && row.password.length >= 6) {
            const hash = bcrypt.hash(row.password, 10);
            companyData.password_hash = hash;

            const company = new TourCompany(companyData);
            await company.save();

            const user = new require('../../models').User({
              name: row.name.trim(),
              email: normalizedEmail,
              password_hash: hash,
              role: 'admin',
              company_id: company.id,
            });
            await user.save();

            results.push({
              row: rowNum,
              name: company.name,
              email: user.email,
              company_id: company.id,
            });
            continue;
          }
        }

        const company = new TourCompany(companyData);
        await company.save();

        results.push({
          row: rowNum,
          name: company.name,
          email: company.email || '',
          company_id: company.id,
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

async function getCompanies(req, res) {
  try {
    const companies = await TourCompany.find().sort({ created_at: -1 });
    const result = await Promise.all(
      companies.map(async (company) => {
        const c = company.toObject();
        const companyId = c.id;
        const package_count = await Package.countDocuments({ company_id: companyId });
        const packages = await Package.find({ company_id: companyId }).select('title');
        const titles = packages.map((p) => p.title);
        const revenueAgg = await Booking.aggregate([
          { $match: { title: { $in: titles }, status: 'accepted' } },
          { $group: { _id: null, revenue: { $sum: '$price' } } },
        ]);
        c.package_count = package_count;
        c.revenue = revenueAgg.length ? revenueAgg[0].revenue : 0;
        return c;
      })
    );
    return res.json({ companies: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateCompanyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const company = await TourCompany.findOneAndUpdate(
      { id: Number(id) },
      { status },
      { new: true }
    );
    if (!company) return res.status(404).json({ error: 'Company not found' });
    return res.json({ company });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    await Package.updateMany({ company_id: Number(id) }, { $set: { company_id: null } });
    const deleted = await TourCompany.findOneAndDelete({ id: Number(id) });
    if (!deleted) return res.status(404).json({ error: 'Company not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, address, website, description, logo } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (website !== undefined) updateFields.website = website;
    if (description !== undefined) updateFields.description = description;
    if (logo !== undefined) updateFields.logo = logo;

    const company = await TourCompany.findOneAndUpdate(
      { id: Number(id) },
      { $set: updateFields },
      { new: true }
    );
    if (!company) return res.status(404).json({ error: 'Company not found' });
    return res.json({ company });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getCompanies, updateCompanyStatus, deleteCompany, updateCompany, createCompany, importCompanies, upload };
