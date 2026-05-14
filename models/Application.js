const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
        default: ''
    },
    resumeLink: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Prevent duplicate applications (one student per internship)
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
