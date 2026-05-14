const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, password, role, skills, resumeLink } = req.body;
        const email = req.body.email.trim().toLowerCase();
        console.log('Registration attempt:', { name, email, role });

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        console.log('Creating user in database...');
        const user = await User.create({
            name,
            email,
            password,
            role,
            skills,
            resumeLink
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills,
                resumeLink: user.resumeLink,
                token: generateToken(user._id)
            });
        } else {
            console.log('User creation failed: No user returned');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email.trim().toLowerCase();

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'User with this email not found' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills,
                resumeLink: user.resumeLink,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills,
            resumeLink: user.resumeLink,
            bio: user.bio,
            education: user.education
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.skills = req.body.skills || user.skills;
        user.resumeLink = req.body.resumeLink || user.resumeLink;
        user.bio = req.body.bio || user.bio;
        user.education = req.body.education || user.education;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            skills: updatedUser.skills,
            resumeLink: updatedUser.resumeLink,
            bio: updatedUser.bio,
            education: updatedUser.education
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/auth/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        let stats = {};

        if (role === 'student') {
            const Application = require('../models/Application');
            const totalApps = await Application.countDocuments({ applicant: userId });
            const acceptedApps = await Application.countDocuments({ applicant: userId, status: 'accepted' });
            const pendingApps = await Application.countDocuments({ applicant: userId, status: 'pending' });
            
            stats = {
                card1: { label: 'Total Applications', value: totalApps },
                card2: { label: 'Accepted', value: acceptedApps },
                card3: { label: 'Pending Review', value: pendingApps }
            };
        } else if (['company', 'admin', 'mentor', 'coordinator'].includes(role)) {
            const Internship = require('../models/Internship');
            const Application = require('../models/Application');
            
            const totalPostings = await Internship.countDocuments({ postedBy: userId });
            const totalApplicants = await Application.countDocuments({ 
                internship: { $in: await Internship.find({ postedBy: userId }).distinct('_id') } 
            });
            const openRoles = await Internship.countDocuments({ postedBy: userId, status: 'open' });

            stats = {
                card1: { label: 'Active Postings', value: totalPostings },
                card2: { label: 'Total Applicants', value: totalApplicants },
                card3: { label: 'Open Roles', value: openRoles }
            };
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In a real app, this would be a link to your frontend reset password page
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

        // For now, since we don't have an email service, we'll just return the token
        // In production, you'd send an email here
        res.status(200).json({
            success: true,
            data: 'Email sent',
            resetToken // Sending token in response for demonstration purposes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const crypto = require('crypto');
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe, updateProfile, getStats, forgotPassword, resetPassword };
