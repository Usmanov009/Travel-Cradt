const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminAuth = require('../../middleware/adminAuth');
const { getPackages, createPackage, updatePackage, deletePackage, assignPackageCompany } = require('../../controllers/admin/adminPackagesController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/', adminAuth, getPackages);
router.post('/', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), createPackage);
router.put('/:id', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), updatePackage);
router.delete('/:id', adminAuth, deletePackage);
router.patch('/:id/company', adminAuth, assignPackageCompany);

module.exports = router;
