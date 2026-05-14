const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an internship title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Remote'],
        default: 'Full-time'
    },
    stipend: {
        type: String,
        default: 'Unpaid'
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    duration: {
        type: String,
        default: '3 months'
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'filled'],
        default: 'open'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
