const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getReports, resetCompanyReport, resetAllReports } = require('../../controllers/admin/reportsController');

router.get('/', adminAuth, getReports);
router.post('/reset-all', adminAuth, resetAllReports);
router.post('/:companyId/reset', adminAuth, resetCompanyReport);

module.exports = router;