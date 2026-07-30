const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getTravelOffers,
  createTravelOffer,
  updateTravelOffer,
  deleteTravelOffer,
} = require('../../controllers/admin/travelOffersController');

router.get('/', adminAuth, getTravelOffers);
router.post('/', adminAuth, createTravelOffer);
router.put('/:id', adminAuth, updateTravelOffer);
router.delete('/:id', adminAuth, deleteTravelOffer);

module.exports = router;
