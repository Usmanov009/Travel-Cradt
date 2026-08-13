const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getPackages, createPackage, updatePackage, deletePackage, assignPackageCompany, importPackages, upload } = require('../../controllers/admin/adminPackagesController');

router.get('/', adminAuth, getPackages);
router.post('/', adminAuth, createPackage);
router.post('/import', adminAuth, upload.single('file'), importPackages);
router.put('/:id', adminAuth, updatePackage);
router.delete('/:id', adminAuth, deletePackage);
router.patch('/:id/company', adminAuth, assignPackageCompany);

module.exports = router;
