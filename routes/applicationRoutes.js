const express = require('express');
const router = express.Router();
const {
    applyToInternship,
    getMyApplications,
    getApplicationsForInternship,
    updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/applications - Apply (student only)
router.post('/', protect, authorize('student'), applyToInternship);

// GET /api/applications/my - Get my applications (any authenticated user)
router.get('/my', protect, getMyApplications);

// GET /api/applications/internship/:internshipId - View applicants (company/admin)
router.get('/internship/:internshipId', protect, authorize('company', 'admin'), getApplicationsForInternship);

// PUT /api/applications/:id - Update status (company/admin)
router.put('/:id', protect, authorize('company', 'admin'), updateApplicationStatus);

module.exports = router;
