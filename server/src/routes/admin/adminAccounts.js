const express = require('express');
const router = express.Router();
const superAdminAuth = require('../../middleware/superAdminAuth');
const { upload } = require('../../utils/upload');
const { listAdmins, createAdmin, deleteAdmin, resetPassword } = require('../../controllers/admin/adminAccountsController');

router.use(superAdminAuth);
router.get('/', listAdmins);
router.post('/', upload.single('logo'), createAdmin);
router.delete('/:id', deleteAdmin);
router.put('/:id/password', resetPassword);

module.exports = router;
