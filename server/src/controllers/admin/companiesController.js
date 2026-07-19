const { TourCompany, Package, Booking } = require('../../models');
const { upload } = require('../../utils/upload');

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
    const { name, phone, address, website, description } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (website !== undefined) updateFields.website = website;
    if (description !== undefined) updateFields.description = description;

    if (req.files && req.files.logo && req.files.logo[0]) {
      updateFields.logo = '/uploads/logos/' + req.files.logo[0].filename;
    }

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

module.exports = { getCompanies, updateCompanyStatus, deleteCompany, updateCompany };
