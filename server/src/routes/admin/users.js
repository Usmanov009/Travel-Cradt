const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const { getUsers, blockUser, deleteUser } = require('../../controllers/admin/usersController');

router.get('/', adminAuth, getUsers);
router.put('/:id/block', adminAuth, blockUser);
router.delete('/:id', adminAuth, deleteUser);

module.exports = router;
