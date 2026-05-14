const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, getStats, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/forgotpassword
router.post('/forgotpassword', forgotPassword);

// PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', resetPassword);

// GET /api/auth/me (Protected)
router.get('/me', protect, getMe);

// GET /api/auth/stats (Protected)
router.get('/stats', protect, getStats);

// PUT /api/auth/profile (Protected)
router.put('/profile', protect, updateProfile);

module.exports = router;

