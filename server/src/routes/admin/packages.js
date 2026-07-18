const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminAuth = require('../../middleware/adminAuth');
const { getPackages, createPackage, updatePackage, deletePackage, assignPackageCompany } = require('../../controllers/admin/adminPackagesController');

const uploadDir = path.join(__dirname, '../../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
