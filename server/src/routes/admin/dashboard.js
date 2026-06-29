const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getOverview } = require('../../controllers/admin/dashboardController');

router.get('/overview', adminAuth, getOverview);

module.exports = router;
