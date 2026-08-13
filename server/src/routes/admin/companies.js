const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getCompanies, updateCompanyStatus, deleteCompany, updateCompany, createCompany, importCompanies, upload } = require('../../controllers/admin/companiesController');

router.get('/', adminAuth, getCompanies);
router.post('/', adminAuth, createCompany);
router.post('/import', adminAuth, upload.single('file'), importCompanies);
router.put('/:id/status', adminAuth, updateCompanyStatus);
router.put('/:id', adminAuth, updateCompany);
router.delete('/:id', adminAuth, deleteCompany);

module.exports = router;
