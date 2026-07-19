const { User, TourCompany, Package } = require('../../models');
const bcrypt = require('bcryptjs');

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
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin yaratilganda u o'zi tur firma bo'ladi:
// 1) tour_companies jadvalida yangi firma yaratiladi
// 2) users jadvalida shu firmaga bog'liq admin yaratiladi
async function createAdmin(req, res) {
  try {
    const { company_name, company_phone, company_address, email, password } = req.body;

    if (!company_name) return res.status(400).json({ error: 'Tur firma nomi talab qilinadi' });
    if (!email || !password) return res.status(400).json({ error: 'Email va parol talab qilinadi' });
    if (password.length < 6) return res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak" });

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: 'Bu email allaqachon mavjud' });

    const hash = await bcrypt.hash(password, 10);

    // 1. Tur firma yaratish
    const company = new TourCompany({
      name: company_name,
      email: normalizedEmail,
      password_hash: hash,
      phone: company_phone || null,
      address: company_address || null,
      status: 'approved',
    });
    await company.save();

    // 2. Admin user yaratish (tur firma bilan bog'liq)
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
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id: Number(id) });
    if (!user) return res.status(404).json({ error: 'Admin topilmadi' });
    if (user.role === 'super_admin') return res.status(403).json({ error: "Super adminni o'chirish mumkin emas" });

    await User.findByIdAndDelete(user._id);
    // Bog'liq tur firmani ham o'chirish
    if (user.company_id) {
      await Package.updateMany({ company_id: user.company_id }, { $set: { company_id: null } });
      await TourCompany.findOneAndDelete({ id: user.company_id });
    }
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
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
    // Tur firma parolini ham yangilash
    if (user.company_id) {
      await TourCompany.findOneAndUpdate({ id: user.company_id }, { password_hash: hash });
    }
    return res.json({ updated: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listAdmins, createAdmin, deleteAdmin, resetPassword };
