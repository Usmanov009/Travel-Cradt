const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getPackages, createPackage, updatePackage, deletePackage, assignPackageCompany } = require('../../controllers/admin/adminPackagesController');

router.get('/', adminAuth, getPackages);
router.post('/', adminAuth, createPackage);
router.put('/:id', adminAuth, updatePackage);
router.delete('/:id', adminAuth, deletePackage);
router.patch('/:id/company', adminAuth, assignPackageCompany);

module.exports = router;
