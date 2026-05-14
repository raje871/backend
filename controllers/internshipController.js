const Internship = require('../models/Internship');
const Application = require('../models/Application');

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
const getInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ status: 'open' })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(internships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's internships (company view)
// @route   GET /api/internships/my
// @access  Private (company/admin)
const getMyInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ postedBy: req.user._id })
            .sort({ createdAt: -1 });

        // Add applicant count to each internship
        const internshipsWithCounts = await Promise.all(internships.map(async (internship) => {
            const count = await Application.countDocuments({ internship: internship._id });
            return {
                ...internship._doc,
                applicantCount: count
            };
        }));

        res.json(internshipsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
const getInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate('postedBy', 'name email');

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        res.json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private (company/admin)
const createInternship = async (req, res) => {
    try {
        const { title, company, location, type, stipend, description, skillsRequired, duration, deadline } = req.body;

        const internship = await Internship.create({
            title,
            company,
            location,
            type,
            stipend,
            description,
            skillsRequired,
            duration,
            deadline,
            postedBy: req.user._id
        });

        res.status(201).json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (owner/admin)
const updateInternship = async (req, res) => {
    try {
        let internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Check ownership
        if (internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this internship' });
        }

        internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(internship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (owner/admin)
const deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Check ownership
        if (internship.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this internship' });
        }

        // Also delete associated applications
        await Application.deleteMany({ internship: req.params.id });
        await internship.deleteOne();
        
        res.json({ message: 'Internship and associated applications removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInternships, getMyInternships, getInternship, createInternship, updateInternship, deleteInternship };

