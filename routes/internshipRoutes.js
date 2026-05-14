const express = require('express');
const router = express.Router();
const {
    getInternships,
    getMyInternships,
    getInternship,
    createInternship,
    updateInternship,
    deleteInternship
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/internships - Public
router.get('/', getInternships);

// GET /api/internships/my - Private (company/admin only)
router.get('/my', protect, authorize('company', 'admin'), getMyInternships);

// GET /api/internships/:id - Public
router.get('/:id', getInternship);

// POST /api/internships - Private (company/admin only)
router.post('/', protect, authorize('company', 'admin'), createInternship);

// PUT /api/internships/:id - Private (owner/admin only)
router.put('/:id', protect, authorize('company', 'admin'), updateInternship);

// DELETE /api/internships/:id - Private (owner/admin only)
router.delete('/:id', protect, authorize('company', 'admin'), deleteInternship);

module.exports = router;
