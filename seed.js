const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Internship = require('./models/Internship');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await connectDB();

        // 1. Clear existing data
        await User.deleteMany({});
        await Internship.deleteMany({});
        console.log('🗑️ Existing data cleared');

        // 2. Create Users
        const admin = await User.create({
            name: 'Alex Admin',
            email: 'admin@internsync.com',
            password: 'admin123',
            role: 'admin',
            skills: ['Leadership', 'System Admin']
        });

        const company = await User.create({
            name: 'TechCorp HR',
            email: 'hr@techcorp.com',
            password: 'password123',
            role: 'company',
            skills: ['Recruiting', 'Management']
        });

        const student = await User.create({
            name: 'John Doe',
            email: 'john@student.com',
            password: 'password123',
            role: 'student',
            skills: ['React', 'Node.js', 'Python'],
            resumeLink: 'https://example.com/resume.pdf'
        });

        console.log('👤 Users created successfully');

        // 3. Create Internships
        const internships = await Internship.insertMany([
            {
                title: 'Full Stack Developer Intern',
                company: 'TechCorp',
                location: 'Remote',
                type: 'Full-time',
                stipend: '$1000/month',
                description: 'We are looking for a motivated Full Stack Developer Intern to join our engineering team. You will work on building scalable web applications using React and Node.js.',
                skillsRequired: ['React', 'Node.js', 'MongoDB'],
                duration: '6 Months',
                status: 'open',
                postedBy: company._id
            },
            {
                title: 'UI/UX Design Intern',
                company: 'CreativeFlow',
                location: 'New York, NY',
                type: 'Part-time',
                stipend: 'Unpaid',
                description: 'Help us design beautiful interfaces for our mobile applications.',
                skillsRequired: ['Figma', 'Adobe XD'],
                duration: '3 Months',
                status: 'open',
                postedBy: company._id
            },
            {
                title: 'Data Science Intern',
                company: 'DataViz Inc.',
                location: 'Remote',
                type: 'Remote',
                stipend: '$1500/month',
                description: 'Analyze large datasets and build predictive models using Python and TensorFlow.',
                skillsRequired: ['Python', 'TensorFlow', 'Pandas'],
                duration: '4 Months',
                status: 'open',
                postedBy: admin._id
            }
        ]);

        console.log('💼 Internships seeded successfully');
        console.log('\n✅ SEEDING COMPLETE');
        console.log('-----------------------------------');
        console.log('ADMIN:    admin@internsync.com / admin123');
        console.log('COMPANY:  hr@techcorp.com / password123');
        console.log('STUDENT:  john@student.com / password123');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedData();
