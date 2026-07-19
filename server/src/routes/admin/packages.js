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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /png|jpe?g|svg/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Faqat PNG, JPG va SVG rasm fayllari ruxsat etilgan'));
  },
});

router.get('/', adminAuth, getPackages);
router.post('/', adminAuth, upload.single('image'), createPackage);
router.put('/:id', adminAuth, upload.single('image'), updatePackage);
router.delete('/:id', adminAuth, deletePackage);
router.patch('/:id/company', adminAuth, assignPackageCompany);

module.exports = router;
