const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getBookings, updateBooking, assignBookingCompany } = require('../../controllers/admin/adminBookingsController');

router.get('/', adminAuth, getBookings);
router.put('/:id', adminAuth, updateBooking);
router.patch('/:id/company', adminAuth, assignBookingCompany);

module.exports = router;
