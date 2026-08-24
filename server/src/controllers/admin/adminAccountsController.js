const { User, TourCompany, Package } = require('../../models');
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
  let nameIdx, phoneIdx, addressIdx, emailIdx, passwordIdx;

  if (isWord) {
    nameIdx = findCol(headers, ['firma', 'nom', 'name', 'kompaniya', 'company']);
    phoneIdx = findCol(headers, ['telefon', 'phone', 'tel']);
    addressIdx = findCol(headers, ['manzil', 'address', 'adres', 'joy']);
    emailIdx = findCol(headers, ['email', 'e-mail', 'pochta']);
    passwordIdx = findCol(headers, ['parol', 'password', 'kalit']);
  } else {
    nameIdx = findCol(Object.keys(row), ['firma', 'nom', 'name', 'kompaniya', 'company']);
    phoneIdx = findCol(Object.keys(row), ['telefon', 'phone', 'tel']);
    addressIdx = findCol(Object.keys(row), ['manzil', 'address', 'adres', 'joy']);
    emailIdx = findCol(Object.keys(row), ['email', 'e-mail', 'pochta']);
    passwordIdx = findCol(Object.keys(row), ['parol', 'password', 'kalit']);
  }

  const get = (idx) => {
    if (idx < 0) return '';
    if (isWord) return row[idx] || '';
    const key = Object.keys(row)[idx];
    return row[key] != null ? String(row[key]) : '';
  };

  return {
    company_name: get(nameIdx),
    company_phone: get(phoneIdx),
    company_address: get(addressIdx),
    email: get(emailIdx),
    password: get(passwordIdx),
  };
}

async function importAdmins(req, res) {
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

      if (!row.company_name || !row.email || !row.password) {
        errors.push({ row: rowNum, error: "Firma nomi, email va parol to'ldirilishi shart" });
        continue;
      }
      if (row.password.length < 6) {
        errors.push({ row: rowNum, error: "Parol kamida 6 ta belgi bo'lishi kerak" });
        continue;
      }

      try {
        const normalizedEmail = row.email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          errors.push({ row: rowNum, error: `Bu email allaqachon mavjud: ${normalizedEmail}` });
          continue;
        }

        const hash = await bcrypt.hash(row.password, 10);

        const company = new TourCompany({
          name: row.company_name.trim(),
          email: normalizedEmail,
          password_hash: hash,
          phone: row.company_phone ? row.company_phone.trim() : null,
          address: row.company_address ? row.company_address.trim() : null,
          status: 'approved',
        });
        await company.save();

        const user = new User({
          name: row.company_name.trim(),
          email: normalizedEmail,
          password_hash: hash,
          role: 'admin',
          company_id: company.id,
        });
        await user.save();

        results.push({
          row: rowNum,
          company_name: company.name,
          email: user.email,
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

async function listAdmins(req, res) {
  try {
    const admins = await User.find({ role: 'admin' })
      .sort({ created_at: -1 })
      .select('id name email role blocked created_at company_id');
    const result = await Promise.all(
      admins.map(async (admin) => {
        const a = admin.toObject();
        if (a.company_id) {
          const tc = await TourCompany.findOne({ id: a.company_id }).select('name phone status');
          a.company_name = tc ? tc.name : null;
          a.company_phone = tc ? tc.phone : null;
          a.company_status = tc ? tc.status : null;
        } else {
          a.company_name = null;
          a.company_phone = null;
          a.company_status = null;
        }
        return a;
      })
    );
    return res.json({ admins: result });
  } catch (err) {
    console.error('listAdmins error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

async function createAdmin(req, res) {
  try {
    const { company_name, company_phone, company_address, email, password, logo } = req.body;

    if (!company_name) return res.status(400).json({ error: 'Tur firma nomi talab qilinadi' });
    if (!email || !password) return res.status(400).json({ error: 'Email va parol talab qilinadi' });
    if (password.length < 6) return res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak" });

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: 'Bu email allaqachon mavjud' });

    const hash = await bcrypt.hash(password, 10);

    const company = new TourCompany({
      name: company_name,
      email: normalizedEmail,
      password_hash: hash,
      phone: company_phone || null,
      address: company_address || null,
      status: 'approved',
      logo: logo,
    });
    await company.save();

    const user = new User({
      name: company_name,
      email: normalizedEmail,
      password_hash: hash,
      role: 'admin',
      company_id: company.id,
    });
    await user.save();

    return res.json({
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        created_at: user.created_at,
        company_name: company.name,
        company_logo: company.logo,
      },
    });
  } catch (err) {
    console.error('createAdmin error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id: Number(id) });
    if (!user) return res.status(404).json({ error: 'Admin topilmadi' });
    if (user.role === 'super_admin') return res.status(403).json({ error: "Super adminni o'chirish mumkin emas" });

    await User.findByIdAndDelete(user._id);
    if (user.company_id) {
      await Package.updateMany({ company_id: user.company_id }, { $set: { company_id: null } });
      await TourCompany.findOneAndDelete({ id: user.company_id });
    }
    return res.json({ deleted: true });
  } catch (err) {
    console.error('deleteAdmin error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak" });

    const user = await User.findOne({ id: Number(id) });
    if (!user) return res.status(404).json({ error: 'Admin topilmadi' });
    if (user.role === 'super_admin') return res.status(403).json({ error: "Super admin paroli bu yerda o'zgartirilmaydi" });

    const hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password_hash: hash });
    if (user.company_id) {
      await TourCompany.findOneAndUpdate({ id: user.company_id }, { password_hash: hash });
    }
    return res.json({ updated: true });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

module.exports = { listAdmins, createAdmin, deleteAdmin, resetPassword, importAdmins, upload };
