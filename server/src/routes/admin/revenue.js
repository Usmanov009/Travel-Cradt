const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getRevenue } = require('../../controllers/admin/revenueController');

router.get('/', adminAuth, getRevenue);

module.exports = router;
