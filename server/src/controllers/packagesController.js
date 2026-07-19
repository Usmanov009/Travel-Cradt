const { Package, TourCompany } = require('../models');

async function getPackages(req, res) {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const packages = await Package.find(filter).sort({ created_at: -1 }).limit(200);

    const companyIds = [...new Set(packages.map(p => p.company_id).filter(Boolean))];
    const companies = await TourCompany.find({ id: { $in: companyIds } });
    const companyMap = new Map(companies.map(c => [c.id, c]));

    const result = packages.map(p => ({
      ...p.toObject(),
      company_name: companyMap.get(p.company_id)?.name || null,
      company_logo: companyMap.get(p.company_id)?.logo || null,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getPackageById(req, res) {
  try {
    const id = parseInt(req.params.id);
    let pkg = await Package.findOne({ $or: [{ id }, { local_id: id }] }).sort({ id: -1 }).limit(1);

    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    let company_name = null;
    let company_logo = null;
    if (pkg.company_id) {
      const company = await TourCompany.findOne({ id: pkg.company_id });
      if (company) {
        company_name = company.name;
        company_logo = company.logo;
      }
    }

    return res.json({ ...pkg.toObject(), company_name, company_logo });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createPackage(req, res) {
  try {
    const { type, category, title, description, image, duration, price, rating,
            included, country, hotel, flight_included, vibe, video, interests, partners, translations, price_currency, pdf } = req.body;

    const pkg = new Package({
      type: type || 'domestic',
      category,
      title,
      description,
      image: image || null,
      duration,
      price: price || 0,
      rating: rating || 0,
      included: included || [],
      country,
      hotel,
      flight_included: flight_included || false,
      vibe,
      video,
      interests: interests || null,
      partners: partners || null,
      translations: translations || {},
      price_currency: price_currency || 'USD',
      pdf: pdf || null,
    });

    await pkg.save();
    return res.status(201).json(pkg.toObject());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { getPackages, createPackage, getPackageById };
