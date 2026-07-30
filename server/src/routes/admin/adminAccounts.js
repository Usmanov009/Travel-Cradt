const express = require('express');
const router = express.Router();
const superAdminAuth = require('../../middleware/superAdminAuth');
const { listAdmins, createAdmin, deleteAdmin, resetPassword } = require('../../controllers/admin/adminAccountsController');

router.use(superAdminAuth);
router.get('/', listAdmins);
router.post('/', createAdmin);
router.delete('/:id', deleteAdmin);
router.put('/:id/password', resetPassword);

module.exports = router;
