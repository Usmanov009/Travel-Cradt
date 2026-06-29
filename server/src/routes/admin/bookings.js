const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getBookings, updateBooking } = require('../../controllers/admin/adminBookingsController');

router.get('/', adminAuth, getBookings);
router.put('/:id', adminAuth, updateBooking);

module.exports = router;
