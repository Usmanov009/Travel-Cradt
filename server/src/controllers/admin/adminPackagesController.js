const { Package, TourCompany, Booking } = require('../../models');

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
      price, rating, included, country, start_date, end_date, hotel, flight_included,
      vibe, interests, partners, translations, company_id, price_currency
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
      start_date: start_date || null,
      end_date: end_date || null,
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
      price, rating, included, country, start_date, end_date, hotel, flight_included,
      vibe, interests, partners, translations, price_currency
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
        start_date: start_date || null,
        end_date: end_date || null,
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

module.exports = { getPackages, createPackage, updatePackage, deletePackage, assignPackageCompany };
