const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getAdminStats,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/register', registerUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.get('/admin/stats', protect, admin, getAdminStats);

router.route('/')
    .get(protect, admin, getUsers);

router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
