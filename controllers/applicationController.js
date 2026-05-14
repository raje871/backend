const Application = require('../models/Application');
const Internship = require('../models/Internship');

// @desc    Apply to an internship
// @route   POST /api/applications
// @access  Private (student only)
const applyToInternship = async (req, res) => {
    try {
        const { internshipId, coverLetter, resumeLink } = req.body;

        // Check if internship exists and is open
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        if (internship.status !== 'open') {
            return res.status(400).json({ message: 'This internship is no longer accepting applications' });
        }

        // Check for duplicate application
        const existingApplication = await Application.findOne({
            internship: internshipId,
            applicant: req.user._id
        });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this internship' });
        }

        const application = await Application.create({
            internship: internshipId,
            applicant: req.user._id,
            coverLetter,
            resumeLink: resumeLink || req.user.resumeLink
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications for current user (student view)
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate('internship', 'title company location type stipend status')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications for an internship (company view)
// @route   GET /api/applications/internship/:internshipId
// @access  Private (company/admin)
const getApplicationsForInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.internshipId);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Only owner or admin can view applications
        if (internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ internship: req.params.internshipId })
            .populate('applicant', 'name email skills resumeLink')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update application status (accept/reject)
// @route   PUT /api/applications/:id
// @access  Private (company/admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id)
            .populate('internship');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Only the internship owner or admin can update
        if (application.internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { applyToInternship, getMyApplications, getApplicationsForInternship, updateApplicationStatus };
