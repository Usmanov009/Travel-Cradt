const { TravelOffer } = require('../../models');

async function getTravelOffers(req, res) {
  try {
    const offers = await TravelOffer.find().sort({ created_at: -1 });
    return res.json({ offers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createTravelOffer(req, res) {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Faqat super admin' });

    const { type, title, image, description, phone, location } = req.body;
    if (!title) return res.status(400).json({ error: 'Nomi kerak' });

    const offer = new TravelOffer({
      type: type === 'hotel' ? 'hotel' : 'flight',
      title,
      image,
      description,
      phone,
      location,
    });
    await offer.save();
    return res.json({ offer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateTravelOffer(req, res) {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Faqat super admin' });

    const { id } = req.params;
    const { type, title, image, description, phone, location } = req.body;

    const updateFields = {};
    if (type !== undefined) updateFields.type = type === 'hotel' ? 'hotel' : 'flight';
    if (title !== undefined) updateFields.title = title;
    if (image !== undefined) updateFields.image = image;
    if (description !== undefined) updateFields.description = description;
    if (phone !== undefined) updateFields.phone = phone;
    if (location !== undefined) updateFields.location = location;

    const offer = await TravelOffer.findOneAndUpdate({ id: Number(id) }, updateFields, { new: true });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ offer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteTravelOffer(req, res) {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Faqat super admin' });

    const { id } = req.params;
    const deleted = await TravelOffer.findOneAndDelete({ id: Number(id) });
    if (!deleted) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getTravelOffers, createTravelOffer, updateTravelOffer, deleteTravelOffer };
