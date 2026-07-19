const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getCompanies, updateCompanyStatus, deleteCompany, updateCompany } = require('../../controllers/admin/companiesController');

router.get('/', adminAuth, getCompanies);
router.put('/:id/status', adminAuth, updateCompanyStatus);
router.put('/:id', adminAuth, updateCompany);
router.delete('/:id', adminAuth, deleteCompany);

module.exports = router;
